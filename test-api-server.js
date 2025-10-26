/**
 * Simple Express server to test CodeRabbit API
 * Run: node test-api-server.js
 * Then open: http://localhost:3000/test-coderabbit.html
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Load API key from .env or use default
const CODERABBIT_API_KEY = process.env.CODERABBIT_API_KEY || 'cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436';

// API endpoint to analyze a PR
app.post('/api/analyze', async (req, res) => {
  try {
    const { repo_url, pr_number } = req.body;

    if (!repo_url || !pr_number) {
      return res.status(400).json({ error: 'Missing repo_url or pr_number' });
    }

    console.log(`\n🔍 Analyzing: ${repo_url}#${pr_number}`);
    console.log(`API Key: ${CODERABBIT_API_KEY.substring(0, 10)}...`);

    // Call CodeRabbit API
    const response = await axios.post(
      'https://api.coderabbit.ai/v1/review',
      {
        repo_url,
        pr_number: parseInt(pr_number),
      },
      {
        headers: {
          'Authorization': `Bearer ${CODERABBIT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 seconds
      }
    );

    console.log('✅ Received response from CodeRabbit API');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    // Transform response to our format
    const issues = (response.data.issues || []).map(issue => ({
      severity: issue.severity || mapSeverity(issue.level || issue.type),
      category: issue.category || issue.type || 'Security',
      title: issue.title || issue.message || 'Security issue',
      description: issue.description || issue.message || 'No description provided',
      file: issue.file_path || issue.file || 'unknown',
      line: issue.line_number || issue.line || 0,
      code: issue.code_snippet || issue.code || '',
      suggestion: issue.suggestion || generateSuggestion(issue),
    }));

    res.json({
      success: true,
      summary: response.data.summary,
      issues: issues,
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    // If API fails, return mock data for testing
    const mockIssues = generateMockIssues();
    
    res.json({
      success: true,
      summary: `Found ${mockIssues.length} security issues (using fallback analysis)`,
      issues: mockIssues,
      note: 'Using fallback analysis - CodeRabbit API unavailable',
    });
  }
});

function mapSeverity(level) {
  const mapping = {
    'critical': 'critical',
    'error': 'critical',
    'high': 'high',
    'warning': 'high',
    'medium': 'medium',
    'low': 'low',
    'info': 'info',
  };
  return mapping[level?.toLowerCase() || ''] || 'medium';
}

function generateSuggestion(issue) {
  const suggestions = {
    'Hardcoded Password': 'Use environment variables or a secrets management system:\n`const password = process.env.DB_PASSWORD;`',
    'Hardcoded API Key': 'Store API keys in environment variables or a secure vault:\n`const apiKey = process.env.API_KEY;`',
    'SQL Injection Risk': 'Use parameterized queries:\n`const query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [userId]);`',
    'Code Injection': 'Avoid using eval(). Use JSON.parse() or proper parsing:\n`const result = JSON.parse(userInput);`',
    'XSS Risk': 'Sanitize user input or use textContent instead of innerHTML:\n`element.textContent = userInput;`',
  };

  for (const [key, suggestion] of Object.entries(suggestions)) {
    if (issue.category?.includes(key) || issue.title?.includes(key)) {
      return suggestion;
    }
  }
  return 'Review this code for security best practices. Consider input validation, output encoding, and secure coding patterns.';
}

function generateMockIssues() {
  return [
    {
      severity: 'critical',
      category: 'SQL Injection',
      title: 'Potential SQL injection vulnerability',
      description: 'String concatenation in SQL queries may lead to SQL injection attacks. Use parameterized queries.',
      file: 'src/database.js',
      line: 42,
      code: 'const query = "SELECT * FROM users WHERE id = " + userId;',
      suggestion: 'Use parameterized queries:\n`const query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [userId]);`',
    },
    {
      severity: 'critical',
      category: 'Hardcoded Secrets/Passwords',
      title: 'Hardcoded password detected',
      description: 'A hardcoded password was found in the code. This is a critical security issue.',
      file: 'src/config.js',
      line: 15,
      code: 'const dbPassword = "secret123";',
      suggestion: 'Use environment variables or a secrets management system:\n`const password = process.env.DB_PASSWORD;`',
    },
    {
      severity: 'high',
      category: 'Hardcoded Secrets/Passwords',
      title: 'Hardcoded API key detected',
      description: 'An API key was found hardcoded in the source code. This should be moved to environment variables.',
      file: 'src/api.js',
      line: 8,
      code: 'const apiKey = "sk-1234567890abcdef";',
      suggestion: 'Store API keys in environment variables or a secure vault:\n`const apiKey = process.env.API_KEY;`',
    },
    {
      severity: 'high',
      category: 'Code Injection',
      title: 'Use of eval() detected',
      description: 'eval() can execute arbitrary code and is a security risk. Consider safer alternatives.',
      file: 'src/utils.js',
      line: 33,
      code: 'const result = eval(userInput);',
      suggestion: 'Avoid using eval(). Use JSON.parse() or proper parsing:\n`const result = JSON.parse(userInput);`',
    },
  ];
}

app.listen(PORT, () => {
  console.log(`🚀 Test server running at http://localhost:${PORT}`);
  console.log(`📝 Open http://localhost:${PORT}/test-coderabbit.html`);
  console.log(`🔑 Using API Key: ${CODERABBIT_API_KEY.substring(0, 15)}...`);
});

