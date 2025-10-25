// New exported API: generateReport(benchmark, targets)
// This function prompts the LLM to evaluate each benchmark constraint against the provided targets.
// It leverages the Kali execution tool for running commands and returns the final aggregated report text
// produced by the LLM (attempting JSON when possible).
import { createDeepInfra } from "@ai-sdk/deepinfra";
import { tool, ModelMessage, generateText, stepCountIs } from "ai";
import { z } from 'zod';
import { executeKaliCommand } from './kali';
import * as fs from 'fs';
import * as path from 'path';

const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_API_KEY,
});
const kaliTool = tool({
    description: 'Run a bash shell command on Kali Linux VM. Returns stdout and stderr output.',
    inputSchema: z.object({
      commandStr: z.string().describe('Bash shell command to be run'),
    }),
    execute: async ({ commandStr }) => {
      // Pass undefined panel to allow kali.ts to resolve active panel if available
      return await executeKaliCommand(commandStr, undefined, false);
    },
});
// Load constraints for a known benchmark from assets CSV files
async function benchmarkToConstraints(benchmark: string): Promise<Array<{name: string; section: string; granular: string; kaliTest: string;}>> {
  if (benchmark !== 'OWASP') return [];
  const csvPath = path.resolve(__dirname, '..', '..', 'assets', 'OWASP.csv');
  const csvText = await fs.promises.readFile(csvPath, 'utf-8');
  const rows = parseCsv(csvText);
  // Map CSV headers to our normalized object keys
  return rows.map((r: any) => ({
    name: r['name'] ?? r['Name'] ?? '',
    section: r['section name'] ?? r['section'] ?? r['Section'] ?? '',
    granular: r['1-sentence granular constraint'] ?? r['granular'] ?? '',
    kaliTest: r['1-sentence kali test'] ?? r['kali test'] ?? '',
  }));
}

// Minimal CSV parser supporting quoted fields and commas inside quotes; returns array of objects using header row
function parseCsv(text: string): any[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0 && !l.trim().startsWith('.'));
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]);
  const out: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length === 1 && fields[0] === '') continue;
    const obj: any = {};
    header.forEach((h, idx) => {
      obj[h] = fields[idx] ?? '';
    });
    out.push(obj);
  }
  return out;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === ',') {
        result.push(current);
        current = '';
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}
export async function generateReport(
  benchmark: string,
  targets: string[],
  options?: {
    llmCall?: (messages: ModelMessage[]) => Promise<string>;
    constraints?: Array<{ name: string; section: string; granular: string; kaliTest: string }>;
  }
) {
  const constraints = options?.constraints ?? (await benchmarkToConstraints(benchmark));
  const results: Array<{ constraint: string; status: string; evidence: string | null; commands: string[] | null }> = [];

  // Default LLM call implementation using DeepInfra and AI SDK
  const defaultLlmCall = async (messages: ModelMessage[]) => {
    const gen = await generateText({
      model: deepinfra("deepseek-ai/DeepSeek-R1"),
      messages,
      tools: { executeKaliCommand: kaliTool },
      // Allow a bit more tool-stepping than the UI chat
      stopWhen: stepCountIs(12),
    });
    return gen.text;
  };

  const llmCall = options?.llmCall ?? defaultLlmCall;

  for (const constraint of constraints) {
    const { name, section, granular, kaliTest } = constraint;

    // Build a fresh message list for this task to isolate from chat history
    const taskSystemPrompt = `You are an AI pentesting assistant.
        You will evaluate a single constraint for a security benchmark on a target.
        If the constraint is not practical to test with your kali linux environment, return 'NOT TESTABLE' as status and null for evidence and commands.
        
        Otherwise:
        1) Formulate a testing approach.
        2) If needed, call the executeKaliCommand tool with the exact bash commands to run.
        3) Capture outputs and determine PASS/FAIL with reasoning.
        4) Also, return a list of the commands you ran to achieve the output.
        
        At the end, output a concise JSON report with the following shape:
        
        {
            "constraint": string,
            "status": "PASS" | "FAIL" | "NOT TESTABLE",
            "evidence": string,
            "commands": string[]
        }`;

    const userPayload = {
      targets,
      constraint_name: name,
      constraint_section: section,
      constraint_description: granular,
      constraint_suggested_strategy: kaliTest,
    };

    const taskMessages: ModelMessage[] = [
      { role: 'system', content: taskSystemPrompt },
      { role: 'user', content: JSON.stringify(userPayload) },
    ];

    const responseText = await llmCall(taskMessages);
    // Try to parse JSON if the model followed instructions; if not, coerce a minimal structure
    try {
      const parsed = JSON.parse(responseText);
      results.push({
        constraint: parsed.constraint ?? name,
        status: parsed.status ?? 'NOT TESTABLE',
        evidence: parsed.evidence ?? null,
        commands: parsed.commands ?? null,
      });
    } catch {
      results.push({
        constraint: name,
        status: 'NOT TESTABLE',
        evidence: responseText,
        commands: null,
      });
    }
  }

  return { benchmark, targets, results };
}