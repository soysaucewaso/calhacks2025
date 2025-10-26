# CodeRabbit REST API Integration Guide

Complete guide to integrating CodeRabbit AI security analysis via REST API for your hackathon project.

## Table of Contents
- [Quick Start](#quick-start)
- [API Authentication](#api-authentication)
- [Making API Calls](#making-api-calls)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Examples](#examples)
- [Integration Patterns](#integration-patterns)

## Quick Start

### Option 1: Using the REST Client Class (TypeScript)

```typescript
import CodeRabbitRESTClient from './src/coderabbit-rest';

const client = new CodeRabbitRESTClient('your-api-key');

const result = await client.analyzeCode(`
const password = "admin123";
const apiKey = "secret-key";
eval(userInput);
`, {
    focus: ['security'],
    language: 'javascript',
});

console.log(result.review.issues);
```

### Option 2: Direct HTTP Calls (JavaScript)

```javascript
const axios = require('axios');

const response = await axios.post(
    'https://api.coderabbit.ai/v1/analyze',
    {
        code: yourCode,
        settings: {
            focus: ['security'],
            language: 'javascript',
        },
    },
    {
        headers: {
            'Authorization': 'Bearer your-api-key',
            'Content-Type': 'application/json',
        },
    }
);

console.log(response.data.review.issues);
```

## API Authentication

Your API key: `cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436`

Include it in the Authorization header:
```
Authorization: Bearer cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436
```

## Making API Calls

### Endpoint
```
POST https://api.coderabbit.ai/v1/analyze
```

### Request Format

```json
{
  "code": "const password = 'secret123';",
  "settings": {
    "focus": ["security", "best-practices"],
    "language": "javascript",
    "strict": true
  },
  "context": {
    "file_path": "src/auth.js",
    "repo": "my-repo",
    "branch": "main"
  }
}
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | ✅ | Code content to analyze |
| `settings` | object | ❌ | Analysis settings |
| `settings.focus` | array | ❌ | Focus areas: `security`, `best-practices`, `performance` |
| `settings.language` | string | ❌ | Language: `auto`, `javascript`, `python`, etc. |
| `context` | object | ❌ | Additional context info |

### Response Format

```json
{
  "review": {
    "summary": "Found 3 security issue(s)",
    "issues": [
      {
        "severity": "critical",
        "category": "Hardcoded Password",
        "title": "Hardcoded password detected",
        "description": "A hardcoded password was found...",
        "file": "src/auth.js",
        "line": 5,
        "code": "const password = 'secret123';",
        "suggestion": "Use environment variables"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-10-26T00:00:00Z",
    "analysis_duration": 1.23,
    "language_detected": "javascript"
  }
}
```

### Severity Levels

- 🔴 **critical**: Immediate security threats
- 🟠 **high**: Serious security flaws
- 🟡 **medium**: Moderate security concerns
- 🔵 **low**: Minor issues
- ℹ️ **info**: Recommendations

## Examples

### Example 1: Analyze Single File

```javascript
const code = fs.readFileSync('src/auth.js', 'utf8');

const response = await axios.post(
    'https://api.coderabbit.ai/v1/analyze',
    {
        code,
        settings: { focus: ['security'] },
    },
    {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
    }
);

const criticalIssues = response.data.review.issues.filter(
    i => i.severity === 'critical'
);
```

### Example 2: Analyze Multiple Files

```javascript
const files = [
    'src/auth.js',
    'src/api.js',
    'src/database.js',
];

const results = await Promise.all(
    files.map(async (file) => {
        const code = fs.readFileSync(file, 'utf8');
        const response = await axios.post(
            'https://api.coderabbit.ai/v1/analyze',
            { code, settings: { focus: ['security'] } },
            { headers: { 'Authorization': `Bearer ${API_KEY}` } }
        );
        return { file, issues: response.data.review.issues };
    })
);
```

### Example 3: Integration with Express.js

```javascript
const express = require('express');
const axios = require('axios');

app.post('/api/analyze-code', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.coderabbit.ai/v1/analyze',
            {
                code: req.body.code,
                settings: { focus: ['security'] },
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CODERABBIT_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({
            success: true,
            issues: response.data.review.issues,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### Example 4: Webhook Integration

```javascript
// GitHub webhook to analyze pull requests
app.post('/webhook/github', async (req, res) => {
    const { code, prNumber, repo } = req.body;

    const analysis = await axios.post(
        'https://api.coderabbit.ai/v1/analyze',
        {
            code,
            context: { prNumber, repo },
            settings: { focus: ['security'] },
        },
        {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
        }
    );

    // Post results as PR comment
    await postPRComment(analysis.data.review.issues);
});
```

## Integration Patterns

### Pattern 1: Pre-commit Hook

```javascript
// .git/hooks/pre-commit
const { exec } = require('child_process');
const axios = require('axios');

const changedFiles = exec('git diff --cached --name-only');

for (const file of changedFiles) {
    const code = fs.readFileSync(file, 'utf8');
    const analysis = await axios.post(
        'https://api.coderabbit.ai/v1/analyze',
        { code, settings: { focus: ['security'] } },
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );

    if (analysis.data.review.issues.some(i => i.severity === 'critical')) {
        console.error('Critical security issues found!');
        process.exit(1);
    }
}
```

### Pattern 2: CI/CD Integration

```yaml
# .github/workflows/security-check.yml
name: Security Analysis

on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Analyze with CodeRabbit
        run: |
          node analyze-pr.js
```

### Pattern 3: VS Code Extension

```typescript
vscode.commands.registerCommand('analyzeSecurity', async () => {
    const editor = vscode.window.activeTextEditor;
    const code = editor.document.getText();

    const response = await axios.post(
        'https://api.coderabbit.ai/v1/analyze',
        { code, settings: { focus: ['security'] } },
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );

    // Show diagnostics
    showIssues(response.data.review.issues);
});
```

## Testing

Run the test examples:

```bash
# Test REST client class
npx ts-node examples/test-coderabbit-rest.ts

# Test simple HTTP
node examples/simple-http-example.js
```

## Common Use Cases

1. **Pre-commit Security Checks**: Analyze code before committing
2. **PR Reviews**: Automatic security analysis on pull requests
3. **Code Auditing**: Batch analysis of entire codebases
4. **Developer Education**: Real-time feedback in IDE
5. **CI/CD Integration**: Automated security scanning in pipelines

## Rate Limits

- Free tier: 100 requests/day
- Pro tier: 1000 requests/day
- Enterprise: Custom limits

## Support

For issues or questions:
- Email: support@coderabbit.ai
- Documentation: https://docs.coderabbit.ai
- Status: https://status.coderabbit.ai

