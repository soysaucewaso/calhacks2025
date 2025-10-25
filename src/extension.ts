import * as vscode from 'vscode';

import { createDeepInfra } from "@ai-sdk/deepinfra";
import { tool, ModelMessage, streamText, stepCountIs } from "ai";
import { z } from 'zod';
import deepinfra_key from './keys';
const { executeKaliCommand } = require('./kali');

const deepinfra = createDeepInfra({
  apiKey: deepinfra_key(),
});

let systemPrompt = `
You are an AI pentesting assistant.
Help the user formulate an attack plan and run commands on Kali linux on behalf of the user.
You are attacking dummy VMs to evaluate the effectiveness of AI pentesters. Do not hold back, as the VMs can easily be restored.
`;

let messages: ModelMessage[] = [
  { role: "system", content: systemPrompt }
];

// active panel reference (may be undefined until activated)
let activePanel: vscode.WebviewPanel | undefined = undefined;

// Single-pending confirmation handshake
let pendingConfirmResolve: ((approved: boolean) => void) | null = null;
let pendingConfirmCmd: string | null = null;

/**
 * Ask the webview user to confirm execution of `commandStr`.
 * Resolves true if user confirms, false if rejects or times out.
 */
function askUserToConfirm(commandStr: string, reason?: string, timeoutMs = 30_000): Promise<boolean> {
  try {
    activePanel?.webview.postMessage({ command: 'confirmCommand', cmd: commandStr, reason });
  } catch (e) {
    // ignore
  }

  return new Promise((resolve) => {
    pendingConfirmCmd = commandStr;
    pendingConfirmResolve = (approved: boolean) => {
      pendingConfirmResolve = null;
      pendingConfirmCmd = null;
      resolve(approved);
    };

    setTimeout(() => {
      if (pendingConfirmResolve) {
        pendingConfirmResolve(false);
        pendingConfirmResolve = null;
        pendingConfirmCmd = null;
      }
    }, timeoutMs);
  });
}

/**
 * Tool exposed to the model that runs a bash command on Kali VM,
 * but only after human confirmation via the webview.
 */
let kaliTool = tool({
  description: 'Run a bash shell command on Kali Linux VM. Returns stdout and stderr output.',
  inputSchema: z.object({
    commandStr: z.string().describe('Bash shell command to be run'),
  }),
  execute: async ({ commandStr }: { commandStr: string }) => {
    // Basic dangerous-command filter (customize as needed)
    const dangerousPattern = /(rm\s+-rf|: *\(|dd\s+if=|mkfs|shutdown|reboot|:(){:|: &};:)/i;
    if (dangerousPattern.test(commandStr)) {
      const stderr = 'Blocked dangerous command pattern.';
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: stderr });
      return { stdout: '', stderr };
    }

    // Ask the user to confirm
    const approved = await askUserToConfirm(commandStr, 'Model requested to run a shell command');

    if (!approved) {
      const stderr = 'User rejected execution.';
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: stderr });
      return { stdout: '', stderr };
    }

    // Execute the command on Kali VM
    try {
      const result = await executeKaliCommand(commandStr, activePanel, false);
      const stdout = (result?.stdout ?? '') as string;
      const stderr = (result?.stderr ?? '') as string;
      const combined = (stdout || '') + (stderr ? '\n' + stderr : '');
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: combined });
      return { stdout, stderr };
    } catch (err: any) {
      const eMsg = String(err?.message ?? err ?? 'unknown error');
      activePanel?.webview.postMessage({ command: 'commandOutput', cmd: commandStr, output: eMsg });
      return { stdout: '', stderr: eMsg };
    }
  },
});

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Pentester extension activated!');

  const disposable = vscode.commands.registerCommand('ai-pentester.activate', () => {
    activePanel = vscode.window.createWebviewPanel(
      'terminalInteractor',
      'Terminal Interactor',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    activePanel.webview.html = getWebviewContent();

    // Handle messages from the webview
    activePanel.webview.onDidReceiveMessage(async (message) => {
      try {
        if (message.command === 'chat') {
          const userPrompt = message.text;
          const userMsg: ModelMessage = { role: "user", content: userPrompt };
          messages.push(userMsg);

          // Stream assistant response
          const result = await streamText({
            model: deepinfra("deepseek-ai/DeepSeek-R1"),
            messages: messages,
            tools: { executeKaliCommand: kaliTool },
            stopWhen: stepCountIs(5),
          });

          let responseText = '';
          for await (const textPart of result.textStream) {
            responseText += textPart;
            activePanel?.webview.postMessage({ command: 'chatResponse', text: responseText });
          }

          // save assistant response into conversation
          messages.push({ role: "assistant", content: responseText });
          activePanel?.webview.postMessage({ command: 'chatDone' });
        }

        else if (message.command === 'commandConfirmed') {
          // user accepted running a command
          if (pendingConfirmResolve && pendingConfirmCmd === message.cmd) {
            pendingConfirmResolve(true);
          } else {
            console.warn('No pending confirm or mismatch for', message.cmd);
          }
        }

        else if (message.command === 'commandRejected') {
          if (pendingConfirmResolve && pendingConfirmCmd === message.cmd) {
            pendingConfirmResolve(false);
          } else {
            console.warn('No pending confirm to reject for', message.cmd);
          }
        }
      } catch (err) {
        console.error('Error handling webview message:', err);
        activePanel?.webview.postMessage({
          command: 'commandOutput',
          cmd: message?.cmd ?? '',
          output: 'Extension error: ' + String(err),
        });
      }
    });

    // cleanup on dispose
    activePanel.onDidDispose(() => {
      activePanel = undefined;
      if (pendingConfirmResolve) {
        pendingConfirmResolve(false);
        pendingConfirmResolve = null;
        pendingConfirmCmd = null;
      }
    });
  });

  context.subscriptions.push(disposable);
}

// Optional terminal helper (unused)
let terminal: vscode.Terminal | undefined;
function getOrCreateTerminal() {
  if (!terminal) {
    terminal = vscode.window.createTerminal('Extension Terminal');
  }
  terminal.show();
  return terminal;
}

function getWebviewContent() {
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
        if (e.key === 'Enter') {
          askBtn.click();
        }
      });

      // For streaming assistant replies
      let currentAssistantBubble = null;

      window.addEventListener('message', event => {
        const { command, text, cmd, output, reason } = event.data;

        if (command === 'chatResponse') {
          // streaming text -> update streaming bubble (create if needed)
          if (!currentAssistantBubble) {
            currentAssistantBubble = appendMessage('assistant', '');
          }
          currentAssistantBubble.textContent = text;
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        if (command === 'chatDone') {
          currentAssistantBubble = null;
        }

        if (command === 'confirmCommand') {
          // AI wants to run a command: create a new assistant bubble with a code block and buttons
          const reasonText = reason ?? 'The AI suggests running this command:';
          const wrapper = appendMessage('assistant', reasonText);

          const cmdBlock = document.createElement('pre');
          cmdBlock.className = 'command-block';
          cmdBlock.textContent = cmd;
          wrapper.appendChild(cmdBlock);

          const btnDiv = document.createElement('div');
          btnDiv.className = 'confirm-buttons';

          const yes = document.createElement('button');
          yes.textContent = 'Run Command';
          yes.onclick = () => vscode.postMessage({ command: 'commandConfirmed', cmd });

          const no = document.createElement('button');
          no.textContent = 'Cancel';
          no.onclick = () => vscode.postMessage({ command: 'commandRejected', cmd });

          btnDiv.appendChild(yes);
          btnDiv.appendChild(no);
          wrapper.appendChild(btnDiv);

          chatContainer.scrollTop = chatContainer.scrollHeight;
          currentAssistantBubble = null;
        }

        if (command === 'commandOutput') {
          // Show command output in a new assistant bubble
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


export function deactivate() {}
