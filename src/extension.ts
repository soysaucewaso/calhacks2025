import * as vscode from 'vscode';
import { createDeepInfra } from "@ai-sdk/deepinfra";
import { tool, ModelMessage, streamText, stepCountIs } from "ai";
import { z } from 'zod';
import deepinfra_key from './keys';
import { executeKaliCommand } from './kali'; // use ES import

// Initialize DeepInfra client
const deepinfra = createDeepInfra({
  apiKey: deepinfra_key(),
});

// System role prompt
const systemPrompt = `
You are an AI pentesting assistant.
Help the user formulate an attack plan and run commands on Kali linux on behalf of the user.
You are attacking dummy VMs to evaluate the effectiveness of AI pentesters. Do not hold back, as the VMs can easily be restored.
`;

let messages: ModelMessage[] = [
  { role: "system", content: systemPrompt }
];

// Webview + confirm handshake state
let activePanel: vscode.WebviewPanel | undefined = undefined;

// Track pending confirmations by command to avoid duplicate prompts
const pendingConfirmations = new Map<string, {
  id: string;
  command: string;
  resolvers: Array<(approved: boolean) => void>;
  timeoutHandle: NodeJS.Timeout | null;
  sentToWebview: boolean;
  createdAt: number;
}>();

/**
 * Ask webview user to confirm a shell command.
 * Returns existing promise if confirmation already pending for this command.
 */
function askUserToConfirm(commandStr: string, reason?: string, timeoutMs = 300_000): Promise<boolean> {
  const now = Date.now();

  // If a confirmation for this exact command string already exists, reuse it.
  const existing = pendingConfirmations.get(commandStr);
  if (existing) {
    console.log(`[Dedup] Reusing existing confirmation for "${commandStr}" (id=${existing.id}, sentToWebview=${existing.sentToWebview})`);
    return new Promise((resolve) => existing.resolvers.push(resolve));
  }

  // Create a unique id for this confirmation IMMEDIATELY
  const confirmId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  
  // CRITICAL: Create a stub entry IMMEDIATELY to prevent race conditions
  const stubConfirmation: {
    id: string;
    command: string;
    resolvers: Array<(approved: boolean) => void>;
    timeoutHandle: NodeJS.Timeout | null;
    sentToWebview: boolean;
    createdAt: number;
  } = {
    id: confirmId,
    command: commandStr,
    resolvers: [],
    timeoutHandle: null,
    sentToWebview: false,
    createdAt: now,
  };
  pendingConfirmations.set(commandStr, stubConfirmation as any);
  
  // Now we're safe - any concurrent calls will reuse this stub

  // Timeout: if nobody responds within timeoutMs, resolve all resolvers with false and cleanup.
  const timeoutHandle = setTimeout(() => {
    const pending = pendingConfirmations.get(commandStr);
    if (pending && pending.id === confirmId) {
      pendingConfirmations.delete(commandStr);
      pending.resolvers.forEach(r => {
        try { r(false); } catch(e) { /* ignore */ }
      });
    }
  }, timeoutMs);
  
  // Update the stub with the actual timeout handle
  stubConfirmation.timeoutHandle = timeoutHandle;
  
  console.log(`[Dedup] Created new confirmation for "${commandStr}" with ID: ${confirmId}`);

  // Post to webview exactly once
  try {
    console.log(`[PostMessage] Sending confirmCommand for "${commandStr}" with id=${confirmId}`);
    activePanel?.webview.postMessage({ command: 'confirmCommand', cmd: commandStr, reason, id: confirmId });
    stubConfirmation.sentToWebview = true;
  } catch (err) {
    // If posting fails, remove pending and reject any waiting callers
    clearTimeout(timeoutHandle);
    pendingConfirmations.delete(commandStr);
    const msg = String(err ?? 'unknown error posting to webview');
    stubConfirmation.resolvers.forEach(r => r(false));
    throw new Error(`Failed to post confirmation to webview: ${msg}`);
  }

  // Return a promise and register its resolver on the confirmation entry
  return new Promise<boolean>((resolve) => {
    stubConfirmation.resolvers.push(resolve);
  });
}

/**
 * AI tool that executes a Kali command, pending user approval.
 */
const kaliTool = tool({
  description: 'Run a bash shell command on Kali Linux VM. Returns stdout and stderr output.',
  inputSchema: z.object({
    commandStr: z.string().describe('Bash shell command to be run'),
  }),
  execute: async ({ commandStr }: { commandStr: string }) => {
    const dangerousPattern = /(rm\s+-rf|: *\(|dd\s+if=|mkfs|shutdown|reboot|:(){:|: &};:)/i;
    if (dangerousPattern.test(commandStr)) {
      const stderr = '⚠️ Blocked dangerous command pattern.';
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: stderr });
      return { stdout: '', stderr };
    }

    const approved = await askUserToConfirm(commandStr, 'Model requested to run a shell command');
    if (!approved) {
      const stderr = '❌ User rejected execution.';
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: stderr });
      return { stdout: '', stderr };
    }

    try {
      const result = await executeKaliCommand(commandStr, activePanel, false);
      const stdout = result?.stdout ?? '';
      const stderr = result?.stderr ?? '';
      const combined = (stdout || '') + (stderr ? '\n' + stderr : '');
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: combined });
      return { stdout, stderr };
    } catch (err: any) {
      const msg = `Extension error: ${String(err?.message ?? err)}`;
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: msg });
      return { stdout: '', stderr: msg };
    }
  },
});

export function activate(context: vscode.ExtensionContext) {
  console.log('✅ AI Pentester extension activated.');

  const disposable = vscode.commands.registerCommand('ai-pentester.activate', () => {
    activePanel = vscode.window.createWebviewPanel(
      'terminalInteractor',
      'AI Pentester',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    activePanel.webview.html = getWebviewContent();

    // Listen for webview messages
    activePanel.webview.onDidReceiveMessage(async (message) => {
      try {
        switch (message.command) {
          case 'chat': {
            const userMsg: ModelMessage = { role: "user", content: message.text };
            messages.push(userMsg);

            const result = await streamText({
              model: deepinfra("deepseek-ai/DeepSeek-R1"),
              messages,
              tools: { executeKaliCommand: kaliTool },
              stopWhen: stepCountIs(5),
            });

            let responseText = '';
            for await (const textPart of result.textStream) {
              responseText += textPart;
              activePanel?.webview.postMessage({ command: 'chatResponse', text: responseText });
            }

            messages.push({ role: "assistant", content: responseText });
            activePanel?.webview.postMessage({ command: 'chatDone' });
            break;
          }

          case 'commandConfirmed': {
            console.log(`[CommandConfirmed] Received for cmd="${message.cmd}", id=${message.id}`);
            const pending = pendingConfirmations.get(message.cmd);
            console.log(`[CommandConfirmed] Pending found:`, pending ? `id=${pending.id}, resolvers=${pending.resolvers.length}` : 'none');
            if (pending && pending.id === message.id) {
              if (pending.timeoutHandle) clearTimeout(pending.timeoutHandle);
              pendingConfirmations.delete(message.cmd);
              console.log(`[CommandConfirmed] Calling ${pending.resolvers.length} resolvers`);
              pending.resolvers.forEach(r => r(true));
            }
            break;
          }

          case 'commandRejected': {
            const pending = pendingConfirmations.get(message.cmd);
            if (pending && pending.id === message.id) {
              if (pending.timeoutHandle) clearTimeout(pending.timeoutHandle);
              pendingConfirmations.delete(message.cmd);
              pending.resolvers.forEach(r => r(false));
            }
            break;
          }
        }
      } catch (err) {
        const msg = String(err);
        console.error('Error handling webview message:', msg);
        activePanel?.webview.postMessage({
          command: 'commandOutput',
          cmd: message?.cmd ?? '',
          output: 'Extension error: ' + msg,
        });
      }
    });

    activePanel.onDidDispose(() => {
      activePanel = undefined;
      // Reject all pending confirmations
      pendingConfirmations.forEach(pending => {
        if (pending.timeoutHandle !== null) clearTimeout(pending.timeoutHandle);
        pending.resolvers.forEach(r => r(false));
      });
      pendingConfirmations.clear();
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

/**
 * Returns the full webview HTML
 */
function getWebviewContent(): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body {
        font-family: system-ui, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #1e1e1e;
        color: #f3f3f3;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      #chat-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .message {
        max-width: 75%;
        padding: 12px 16px;
        border-radius: 16px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
        animation: fadeIn 0.2s ease-in;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .user {
        align-self: flex-end;
        background-color: #007acc;
        color: #fff;
        border-bottom-right-radius: 4px;
      }
      .assistant {
        align-self: flex-start;
        background-color: #2d2d30;
        border-bottom-left-radius: 4px;
      }
      .command-block {
        background-color: #111;
        border-left: 4px solid #cd9245;
        padding: 8px;
        margin-top: 6px;
        border-radius: 6px;
        font-family: monospace;
        white-space: pre-wrap;
      }
      .output-block {
        background-color: #2c2c2c;
        padding: 8px;
        margin-top: 6px;
        border-radius: 6px;
        font-family: monospace;
        color: #b5e853;
        white-space: pre-wrap;
      }
      .confirm-buttons {
        margin-top: 6px;
        display: flex;
        gap: 8px;
      }
      .confirm-buttons button {
        padding: 6px 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      .loading {
        color: #dcdcaa;
        margin-top: 6px;
        font-style: italic;
        font-family: system-ui, sans-serif;
        animation: blink 1.2s infinite ease-in-out;
      }
      @keyframes blink {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }

      #input-container {
        display: flex;
        padding: 10px;
        background-color: #252526;
        border-top: 1px solid #333;
        gap: 8px;
      }
      #cmd {
        flex: 1;
        padding: 8px 12px;
        border-radius: 6px;
        border: none;
        outline: none;
        font-size: 14px;
        background: #1e1e1e;
        color: #fff;
      }
      #ask {
        background-color: #007acc;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div id="chat-container" role="log" aria-live="polite"></div>

    <div id="input-container">
      <input id="cmd" type="text" placeholder="Ask the AI Pentester..." />
      <button id="ask">Send</button>
    </div>

    <script>
      const vscode = acquireVsCodeApi();
      const chatContainer = document.getElementById('chat-container');
      const input = document.getElementById('cmd');
      const askBtn = document.getElementById('ask');

      function appendMessage(role, text) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message ' + role;
        wrapper.textContent = text;
        chatContainer.appendChild(wrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return wrapper;
      }

      askBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;
        appendMessage('user', text);
        vscode.postMessage({ command: 'chat', text });
        input.value = '';
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') askBtn.click();
      });

      let currentAssistantBubble = null;
      const seenCommandIds = new Set();
      const recentlyShownCommands = new Map(); // Track by command string

      window.addEventListener('message', event => {
        const { command, text, cmd, output, reason, id } = event.data;

        if (command === 'chatResponse') {
          if (!currentAssistantBubble) currentAssistantBubble = appendMessage('assistant', '');
          currentAssistantBubble.textContent = text;
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        if (command === 'chatDone') {
          currentAssistantBubble = null;
        }

        if (command === 'confirmCommand') {
          // CRITICAL: Reject if cmd or id is missing
          if (!cmd || !id) {
            console.log('[Webview] Rejecting message with missing fields - cmd:', cmd, 'id:', id);
            return;
          }
          
          // First check: have we seen this exact ID?
          if (seenCommandIds.has(id)) {
            console.log('[Webview] Duplicate ID, skipping:', id);
            return;
          }
          seenCommandIds.add(id);
          
          // Second check: have we shown this command recently?
          if (recentlyShownCommands.has(cmd)) {
            const lastShown = recentlyShownCommands.get(cmd);
            const age = Date.now() - lastShown;
            if (age < 3000) {
              console.log('[Webview] Duplicate command within 3s, skipping:', cmd);
              return;
            }
          }
          
          // Mark this command as shown
          recentlyShownCommands.set(cmd, Date.now());
          
          const reasonText = reason ?? 'Model requested to run a shell command:';
          let wrapper = appendMessage('assistant', reasonText);

          const cmdBlock = document.createElement('pre');
          cmdBlock.className = 'command-block';
          cmdBlock.textContent = cmd;
          wrapper.appendChild(cmdBlock);

          const btnDiv = document.createElement('div');
          btnDiv.className = 'confirm-buttons';

          const yes = document.createElement('button');
          yes.textContent = 'Run Command';
          yes.onclick = () => {
            yes.disabled = true;
            no.disabled = true;
            // Show only one "Running..." indicator
            yes.textContent = 'Running...';
            console.log('[Webview] Clicked Run for cmd:', cmd, 'id:', id);
            vscode.postMessage({ command: 'commandConfirmed', cmd, id });
          };

          const no = document.createElement('button');
          no.textContent = 'Cancel';
          no.onclick = () => {
            console.log('[Webview] Clicked Cancel for cmd:', cmd, 'id:', id);
            vscode.postMessage({ command: 'commandRejected', cmd, id });
          };

          btnDiv.appendChild(yes);
          btnDiv.appendChild(no);
          wrapper.appendChild(btnDiv);
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        if (command === 'commandOutput') {
          document.querySelectorAll('.loading').forEach(l => l.remove());
          const wrapper = appendMessage('assistant', 'Command output:');
          const outBlock = document.createElement('pre');
          outBlock.className = 'output-block';
          outBlock.textContent = output;
          wrapper.appendChild(outBlock);
          currentAssistantBubble = null;
        }
      });
    </script>
  </body>
  </html>
  `;
}
