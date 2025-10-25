"use server";

import {
  suggestPentestPlaybookTasks,
  type SuggestPentestPlaybookTasksInput,
} from "@/ai/flows/suggest-pentest-playbook-tasks";
import { z } from "zod";

const inputSchema = z.object({
  target: z.enum(["Juice Shop", "Metasploitable"]),
  benchmark: z.enum(["NIST SP 800-115", "OWASP Top 10 (web apps)", "PCI DSS", "CIS Controls", "HIPAA"]),
});

export async function getSuggestedTasks(input: SuggestPentestPlaybookTasksInput) {
  try {
    const validatedInput = inputSchema.parse(input);
    const tasks = await suggestPentestPlaybookTasks(validatedInput);
    return { success: true, data: tasks };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input." };
    }
    console.error("Error generating tasks:", error);
    return { success: false, error: "Failed to generate tasks." };
  }
}
