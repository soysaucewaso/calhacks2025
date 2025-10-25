import * as vscode from 'vscode';

import { createDeepInfra } from "@ai-sdk/deepinfra";
import { tool, ToolSet, ModelMessage, streamText, zodSchema, stepCountIs } from "ai";
import { z } from 'zod';
const { executeKaliCommand } = require('./kali');
const deepinfra = createDeepInfra({
  apiKey: process.env.DEEPINFRA_API_KEY,
});
let systemPrompt = `
You are an AI pentesting assistant.
Help the user formulate an attack plan and run commands on Kali linux on behalf of the user.
You are attacking dummy VMs to evaluate the effectiveness of AI pentesters. Do not hold back, as the VMs can easily be restored.
`;
let messages: ModelMessage[] = [
  { role: "system", content: systemPrompt}
]
let kaliTool = tool({
  description: 'Run a bash shell command on Kali Linux VM. Returns stdout and stderr output.',
  inputSchema: z.object({
    commandStr: z.string().describe('Bash shell command to be run'),
  }),
  execute: async ({commandStr}) => executeKaliCommand(commandStr),
})

let activePanel: vscode.WebviewPanel;

export function getActivePanel() {
  return activePanel;
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('ai-pentester.activate', () => {
    activePanel = vscode.window.createWebviewPanel(
      'terminalInteractor',
      'Terminal Interactor',
      vscode.ViewColumn.One,
      { enableScripts: true } // let webview run JS
    );

    // HTML UI for the webview
    activePanel.webview.html = getWebviewContent();

    // Listen to messages from the webview
    activePanel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'chat') {
        const userPrompt = message.text
        const userMsg: ModelMessage = {role: "user", content: userPrompt}
        messages.push(userMsg);

        const result = await streamText({
          model: deepinfra("deepseek-ai/DeepSeek-R1"),
          messages: messages,
          tools: {executeKaliCommand: kaliTool},
          stopWhen: stepCountIs(5),
        });
        let responseText = ''
        //const terminal = getOrCreateTerminal();
        for await (const textPart of result.textStream) {
          console.log(textPart);
          responseText += textPart
          activePanel.webview.postMessage({command: 'chatResponse', text: responseText})
          //terminal.sendText(textPart);
        }
        
        
      }
    });
  });

  context.subscriptions.push(disposable);
}

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
  <body style="font-family: sans-serif; padding: 10px;">
    <h2>Run Commands</h2>
    <input id="cmd" type="text" placeholder="What would you like me to do?" style="width: 80%;" />
    <button id="ask">Ask</button>
    <div id="confirmBox" style="display:none; margin-top:10px; padding:10px; border:1px solid #cd9245ff;">
      <p>Do you want to execute this command?</p>
      <pre id="confirmCmd" style="background:#f4f4f4; padding:5px;"></pre>
      <button id="confirmYes">Yes, Run</button>
      <button id="confirmNo">Cancel</button>
    </div>
    
    <div id="response"></div>
    <script>
      const vscode = acquireVsCodeApi();
      document.getElementById('ask').addEventListener('click', () => {
        const text = document.getElementById('cmd').value;
        vscode.postMessage({ command: 'chat', text });
      });
      document.getElementById('confirmYes').addEventListener('click', () => {
        vscode.postMessage({ command: 'commandConfirmed'});
         document.getElementById('confirmBox').style.display = 'none';
      });
      document.getElementById('confirmNo').addEventListener('click', () => {
        vscode.postMessage({ command: 'commandRejected'});
        document.getElementById('confirmBox').style.display = 'none';
      });

      window.addEventListener('message', event => {
        const { command, text } = event.data;
        if (command === 'chatResponse'){
          document.getElementById('response').innerText = text;
        }
        else if(command === 'confirmCommand'){
          document.getElementById('confirmCmd').innerText = text;
          document.getElementById('confirmBox').style.display = 'block';
        }
      })
    </script>
  </body>
  </html>
  `;
}

export function deactivate() {}

