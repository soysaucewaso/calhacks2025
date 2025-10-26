/**
 * Simple HTTP Example: Using CodeRabbit REST API directly with fetch/axios
 * 
 * Usage:
 * 1. Install axios: npm install axios
 * 2. Run: node examples/simple-http-example.js
 */

const axios = require('axios');

// Your CodeRabbit API Key
const API_KEY = 'cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436';
const API_URL = 'https://api.coderabbit.ai/v1/analyze';

// Example vulnerable code
const codeToAnalyze = `
function login(username, password) {
    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    const password = "admin123";
    eval(userInput);
    
    fetch("http://unencrypted-api.com/data");
    
    document.getElementById('content').innerHTML = userContent;
}
`;

async function analyzeWithCodeRabbit() {
    try {
        console.log('🚀 Sending code to CodeRabbit for analysis...\n');
        
        const response = await axios.post(
            API_URL,
            {
                code: codeToAnalyze,
                settings: {
                    focus: ['security'],
                    language: 'javascript',
                },
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            }
        );

        const { review } = response.data;
        
        console.log('📊 Analysis Results:');
        console.log(`Summary: ${review.summary}`);
        console.log(`Total Issues: ${review.issues.length}\n`);

        // Display issues
        review.issues.forEach((issue, index) => {
            console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
            console.log(`   Category: ${issue.category}`);
            console.log(`   Description: ${issue.description}`);
            console.log(`   Location: Line ${issue.line}`);
            console.log(`   Code: ${issue.code.substring(0, 80)}${issue.code.length > 80 ? '...' : ''}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Run the analysis
analyzeWithCodeRabbit();

