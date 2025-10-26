# CodeRabbit AI Integration for Cybersecurity Auditing

## Overview

Successfully integrated CodeRabbit AI into the ai-pentester VS Code extension for automated pull request security analysis.

## What Was Added

### 1. **CodeRabbit Security Analyzer** (`src/coderabbit.ts`)
A comprehensive security analysis module that:
- Fetches pull request data from GitHub
- Analyzes code for security vulnerabilities
- Detects common issues like:
  - Hardcoded passwords
  - Hardcoded API keys
  - SQL injection risks
  - Code injection (eval)
  - XSS vulnerabilities
- Generates detailed security reports with severity classification

### 2. **Extension Integration** (`src/extension.ts`)
- New command: `ai-pentester.analyzePR`
- Interactive prompts for repository owner, name, and PR number
- Progress indicator during analysis
- Detailed markdown report displayed in VS Code
- Summary notifications with issue counts

### 3. **Configuration** (`package.json`)
- Added command registration
- Added VS Code settings for API key configuration
- Updated dependencies

## API Key Configuration

The extension uses the provided API key:
```
cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436
```

You can also configure via:
1. VS Code Settings → Search "AI Pentester" → CodeRabbit API Key
2. Environment variable `CODERABBIT_API_KEY`
3. Default fallback (already configured)

## Usage

1. Open VS Code
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "AI Pentester: Analyze Pull Request Security"
4. Enter:
   - GitHub owner/username
   - Repository name  
   - Pull request number
5. View the comprehensive security report

## Security Report Features

- **Severity Classification**: Critical, High, Medium, Low, Info
- **Issue Categorization**: Hardcoded credentials, injection risks, XSS, etc.
- **Detailed Descriptions**: Explains why each issue is a problem
- **Code Snippets**: Shows the problematic code
- **File and Line References**

## Example Vulnerabilities Detected

- `password = "hardcoded"` → CRITICAL: Hardcoded password
- `api_key = "secret"` → CRITICAL: Hardcoded API key
- `query = "SELECT * FROM users WHERE id = " + userId` → HIGH: SQL injection risk
- `eval(userInput)` → CRITICAL: Code injection vulnerability
- `dangerouslySetInnerHTML={html}` → HIGH: XSS risk

## Dependencies Added

- `@octokit/rest` - GitHub API client
- `axios` - HTTP requests

## Files Modified

- `src/extension.ts` - Added PR analysis command
- `package.json` - Added command and configuration
- `README.md` - Updated with new features
- `src/coderabbit.ts` - New file with analyzer logic

## Next Steps

To test the integration:
1. Run `npm run compile` (already done ✅)
2. Press F5 in VS Code to launch extension development host
3. Test with a real pull request from any public GitHub repository

## Build Status

✅ TypeScript compilation successful
✅ All linter checks passed
✅ Dependencies installed
✅ Ready for testing

