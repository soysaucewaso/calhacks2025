const { NodeSSH } = require("node-ssh");
const { getActivePanel } = require("./extension")

import * as vscode from 'vscode';

const ssh = new NodeSSH();

let extensionPanel: vscode.WebviewPanel | undefined;
export async function executeKaliCommand(commandStr: string){
    if (!extensionPanel){
        extensionPanel = getActivePanel();
    }
    console.log('Extension panel active')
    extensionPanel!.webview.postMessage({command: 'confirmCommand', text: commandStr})
    await new Promise((resolve) => {
      const listener = extensionPanel!.webview.onDidReceiveMessage((message) => {
        if (message.command === "commandConfirmed") {
            resolve(true);
            listener.dispose(); // clean up listener
        }else if (message.command === "commandRejected") {
            resolve(false);
            listener.dispose(); // clean up listener
        }
      });
    });
    return await executeKali(commandStr);
}
async function executeKali(commandStr: string){
    
    console.log(commandStr);
    await ssh.connect({
    // host: "192.168.128.2",   // Your Kali VM IP
    host: "8.tcp.ngrok.io",
    port: 12390,
    username: "aiproxy",
    password: "aiproxy", // or use privateKey: "~/.ssh/id_rsa"
    });

    const result = await ssh.execCommand(commandStr);
    console.log("STDOUT:", result.stdout);
    console.log("STDERR:", result.stderr);

    ssh.dispose();
    return {stdout: result.stdout, stderr: result.stderr};
}

//console.log(await executeKaliCommand('ls && pw'));