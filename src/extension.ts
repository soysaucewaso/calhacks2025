import * as vscode from 'vscode';

import { createDeepInfra } from "@ai-sdk/deepinfra";
import { tool, ToolSet, ModelMessage, streamText, zodSchema, stepCountIs } from "ai";
import { z } from 'zod';
import { CodeRabbitAnalyzer } from './coderabbit';
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

  const analyzePRDisposable = vscode.commands.registerCommand('ai-pentester.analyzePR', async () => {
    // Get CodeRabbit API key from VS Code configuration, environment, or default
    const config = vscode.workspace.getConfiguration('ai-pentester');
    const codeRabbitApiKey = config.get<string>('codeRabbitApiKey') 
      || process.env.CODERABBIT_API_KEY 
      || 'cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436';
    
    // Prompt user for repository information
    const owner = await vscode.window.showInputBox({
      prompt: 'Enter GitHub owner/username',
      placeHolder: 'e.g., microsoft',
    });

    if (!owner) {
      vscode.window.showInformationMessage('Repository owner is required');
      return;
    }

    const repo = await vscode.window.showInputBox({
      prompt: 'Enter repository name',
      placeHolder: 'e.g., vscode',
    });

    if (!repo) {
      vscode.window.showInformationMessage('Repository name is required');
      return;
    }

    const prNumberInput = await vscode.window.showInputBox({
      prompt: 'Enter pull request number',
      placeHolder: 'e.g., 123',
    });

    if (!prNumberInput) {
      vscode.window.showInformationMessage('Pull request number is required');
      return;
    }

    const prNumber = parseInt(prNumberInput, 10);
    if (isNaN(prNumber)) {
      vscode.window.showErrorMessage('Invalid pull request number');
      return;
    }

    // Show progress indicator
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing Pull Request',
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ increment: 0, message: 'Initializing CodeRabbit analyzer...' });

          // Initialize analyzer
          const analyzer = new CodeRabbitAnalyzer(codeRabbitApiKey);

          progress.report({ increment: 30, message: 'Fetching pull request details...' });

          // Analyze the pull request
          const issues = await analyzer.analyzePullRequest(owner, repo, prNumber);

          progress.report({ increment: 60, message: 'Generating security report...' });

          // Generate report
          const report = await analyzer.generateReport(issues);

          progress.report({ increment: 100, message: 'Complete!' });

          // Show the report in a new document
          const doc = await vscode.workspace.openTextDocument({
            content: report,
            language: 'markdown',
          });
          await vscode.window.showTextDocument(doc);

          // Show summary notification
          const criticalCount = issues.filter((i) => i.severity === 'critical').length;
          const highCount = issues.filter((i) => i.severity === 'high').length;

          if (criticalCount > 0 || highCount > 0) {
            vscode.window.showWarningMessage(
              `Security audit complete: ${issues.length} issue(s) found (${criticalCount} critical, ${highCount} high)`
            );
          } else if (issues.length > 0) {
            vscode.window.showInformationMessage(
              `Security audit complete: ${issues.length} issue(s) found (all low/medium severity)`
            );
          } else {
            vscode.window.showInformationMessage('Security audit complete: No security issues found!');
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Error analyzing pull request: ${error}`);
          console.error(error);
        }
      }
    );
  });

  context.subscriptions.push(disposable, analyzePRDisposable);
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

