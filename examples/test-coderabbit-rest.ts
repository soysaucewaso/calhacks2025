/**
 * Example: Testing CodeRabbit REST API Integration
 * Run with: npx ts-node examples/test-coderabbit-rest.ts
 */

import CodeRabbitRESTClient from '../src/coderabbit-rest';
import * as fs from 'fs';
import * as path from 'path';

// Load API key from environment or use default
const API_KEY = process.env.CODERABBIT_API_KEY || 'cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436';

async function testCodeRabbitREST() {
    console.log('🔍 Testing CodeRabbit REST API Integration...\n');

    // Initialize client
    const client = new CodeRabbitRESTClient(API_KEY);

    // Example 1: Analyze vulnerable code
    console.log('📝 Example 1: Analyzing vulnerable code...\n');
    
    const vulnerableCode = `
const password = "admin123";
const apiKey = "sk-1234567890";
const query = "SELECT * FROM users WHERE id = " + userId;
eval(userInput);

// Potential XSS
document.getElementById("content").innerHTML = userInput;
`;

    const result1 = await client.analyzeCode(vulnerableCode, {
        focus: ['security'],
        language: 'javascript',
    });

    console.log('Analysis Result:');
    console.log(`Summary: ${result1.review.summary}`);
    console.log(`Issues found: ${result1.review.issues.length}\n`);

    // Example 2: Generate detailed report
    console.log('📊 Example 2: Generating detailed report...\n');
    const report = client.generateReport(result1);
    console.log(report);

    // Example 3: Analyze multiple files
    console.log('\n📁 Example 3: Analyzing multiple files...\n');
    
    const files = [
        {
            path: 'src/auth.js',
            content: 'const token = localStorage.getItem("token");\nconst password = "secret";',
        },
        {
            path: 'src/api.js',
            content: 'fetch("http://api.example.com/data");\nconst apiKey = "exposed-key-123";',
        },
    ];

    const batchResults = await client.analyzeFiles(files, ['security']);
    
    console.log('\nBatch Analysis Results:');
    batchResults.forEach(result => {
        console.log(`\nFile: ${result.file}`);
        console.log(`Issues: ${result.issues.length}`);
        
        result.issues.forEach(issue => {
            console.log(`  - [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
    });

    console.log('\n✅ Test completed successfully!');
}

// Run the test
testCodeRabbitREST().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});

