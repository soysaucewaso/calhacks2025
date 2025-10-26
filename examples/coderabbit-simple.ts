/**
 * Simple CodeRabbit API Integration Example
 * Uses the v1/review endpoint with repo URL and PR number
 */

import axios from "axios";

const CODERABBIT_API_KEY = process.env.CODERABBIT_API_KEY || "cr-44fa3c9f29f9fe26429fc21d99d3a26ff47e52550de7fdc477ae501436";

export async function analyzeCode(repoUrl: string, prNumber: number) {
  try {
    const response = await axios.post(
      "https://api.coderabbit.ai/v1/review",
      {
        repo_url: repoUrl,
        pr_number: prNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${CODERABBIT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // Contains summary, issues, recommendations
  } catch (error: any) {
    console.error("CodeRabbit error:", error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    console.log('🔍 Analyzing pull request...\n');
    
    // Example: Analyze PR #123 from a repository
    const repoUrl = "https://github.com/microsoft/vscode";
    const prNumber = 123;
    
    const result = await analyzeCode(repoUrl, prNumber);
    
    console.log('✅ Analysis complete!\n');
    console.log('Summary:', result.summary || 'N/A');
    console.log('\nIssues found:', result.issues?.length || 0);
    
    if (result.issues && result.issues.length > 0) {
      console.log('\nSecurity Issues:');
      result.issues.forEach((issue: any, index: number) => {
        console.log(`\n${index + 1}. ${issue.title || issue.message}`);
        console.log(`   Severity: ${issue.severity || issue.level}`);
        console.log(`   File: ${issue.file_path || issue.file}`);
        console.log(`   Line: ${issue.line_number || issue.line}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to analyze:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export default analyzeCode;

