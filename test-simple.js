/**
 * Simple test script to test CodeRabbit API
 * Usage: node test-simple.js
 */

require('dotenv').config();
const axios = require('axios');

const CODERABBIT_API_KEY = process.env.CODERABBIT_API_KEY || 'cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436';

async function testCodeRabbit(repoUrl, prNumber) {
  try {
    console.log('\n🔍 Testing CodeRabbit API...\n');
    console.log(`Repository: ${repoUrl}`);
    console.log(`PR Number: ${prNumber}`);
    console.log(`API Key: ${CODERABBIT_API_KEY.substring(0, 10)}...\n`);

    const response = await axios.post(
      'https://api.coderabbit.ai/v1/review',
      {
        repo_url: repoUrl,
        pr_number: prNumber,
      },
      {
        headers: {
          'Authorization': `Bearer ${CODERABBIT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    console.log('✅ Response received:\n');
    console.log('Summary:', response.data.summary || 'N/A');
    console.log('\nIssues:', response.data.issues?.length || 0);
    
    if (response.data.issues && response.data.issues.length > 0) {
      console.log('\n📋 Detailed Issues:\n');
      response.data.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity || issue.level}] ${issue.title || issue.message}`);
        console.log(`   File: ${issue.file_path || issue.file}:${issue.line_number || issue.line}`);
        if (issue.code_snippet || issue.code) {
          console.log(`   Code: ${(issue.code_snippet || issue.code).substring(0, 80)}...`);
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    console.error('\n📝 Note: This is expected if the CodeRabbit API is not available.');
    console.log('💡 Try running: node test-api-server.js');
    console.log('   Then open: http://localhost:3000/test-coderabbit.html\n');
  }
}

// Test with a public repository
const REPO_URL = process.argv[2] || 'https://github.com/microsoft/vscode';
const PR_NUMBER = parseInt(process.argv[3]) || 200000; // A recent PR

console.log('Usage: node test-simple.js <repo-url> <pr-number>');
console.log(`Example: node test-simple.js https://github.com/microsoft/vscode 123\n`);

testCodeRabbit(REPO_URL, PR_NUMBER);

