# ai-pentester README

AI-powered pentesting and code security analysis VS Code extension for comprehensive cybersecurity auditing.

## Features

### 1. AI Pentesting Assistant
Convert natural language requests into security testing commands. Helps formulate attack plans and run commands on Kali Linux VM for penetration testing.

### 2. **NEW: Pull Request Security Analysis**
Integrated CodeRabbit AI to automatically analyze GitHub pull requests for security vulnerabilities including:
- Hardcoded passwords and API keys
- SQL injection risks  
- Code injection vulnerabilities (eval)
- XSS vulnerabilities
- Best practice violations
- Security anti-patterns

The analyzer provides comprehensive security reports with severity classification (Critical, High, Medium, Low, Info) and actionable recommendations.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

- Node.js 18+
- VS Code 1.105.0 or higher
- CodeRabbit API Key (for PR analysis feature)

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press F5 in VS Code to launch extension development host
4. Or package the extension: `vsce package`

## Configuration

### CodeRabbit API Key

The extension requires a CodeRabbit API key for security analysis. You can configure it in three ways:

1. **VS Code Settings** (Recommended for persistent configuration):
   - Open VS Code settings (Cmd/Ctrl + ,)
   - Search for "AI Pentester"
   - Enter your CodeRabbit API key

2. **Environment Variable**:
   - Add `CODERABBIT_API_KEY=your_api_key` to your system environment variables or `.env` file

3. **Default**: The extension includes a default API key for demo purposes (already configured)

## Usage

### AI Pentester
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Search for "AI Pentester: Open Terminal Interactor"
3. Ask the AI assistant to perform penetration testing tasks
4. Confirm commands before execution

### Pull Request Security Analysis
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Search for "AI Pentester: Analyze Pull Request Security"
3. Enter the GitHub repository owner
4. Enter the repository name
5. Enter the pull request number
6. View the comprehensive security report

The security report will highlight:
- **Critical Issues**: Immediate security threats requiring urgent attention
- **High Priority**: Serious security flaws that should be addressed
- **Medium/Low**: Security concerns following best practices
- **Info**: General recommendations and improvements

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
