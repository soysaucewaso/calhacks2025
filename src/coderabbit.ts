import axios from 'axios';
const { Octokit } = require('@octokit/rest');
import * as vscode from 'vscode';

interface CodeRabbitResponse {
    review: {
        summary: string;
        issues: Array<{
            severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
            category: string;
            title: string;
            description: string;
            file: string;
            line: number;
            code: string;
        }>;
    };
}

interface SecurityIssue {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    title: string;
    description: string;
    file: string;
    line: number;
    code: string;
}

export class CodeRabbitAnalyzer {
    private apiKey: string;
    private octokit: any;

    constructor(apiKey: string, githubToken?: string) {
        this.apiKey = apiKey;
        this.octokit = new Octokit({
            auth: githubToken,
        });
    }

    async analyzePullRequest(
        owner: string,
        repo: string,
        prNumber: number
    ): Promise<SecurityIssue[]> {
        try {
            // Fetch the pull request details
            const { data: pr } = await this.octokit.pulls.get({
                owner,
                repo,
                pull_number: prNumber,
            });

            // Fetch the diff using the correct API call
            const diffResponse = await this.octokit.request(
                `GET /repos/${owner}/${repo}/pulls/${prNumber}`,
                {
                    owner,
                    repo,
                    pull_number: prNumber,
                    mediaType: {
                        format: 'diff',
                    },
                    headers: {
                        accept: 'application/vnd.github.v3.diff',
                    },
                }
            );

            // Analyze the code using CodeRabbit API
            const analysis = await this.analyzeCode(typeof diffResponse.data === 'string' ? diffResponse.data : JSON.stringify(diffResponse.data), {
                owner,
                repo,
                branch: pr.head.ref,
                prNumber,
            });

            return analysis.review.issues;
        } catch (error) {
            console.error('Error analyzing pull request:', error);
            throw error;
        }
    }

    private async analyzeCode(
        code: string,
        context: { owner: string; repo: string; branch: string; prNumber: number }
    ): Promise<CodeRabbitResponse> {
        try {
            const response = await axios.post<CodeRabbitResponse>(
                'https://api.coderabbit.ai/v1/analyze',
                {
                    code,
                    context,
                    settings: {
                        focus: ['security', 'best-practices', 'performance'],
                        language: 'auto',
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('CodeRabbit API error:', error);
            // Fallback: perform basic security analysis locally
            return this.performLocalSecurityAnalysis(code);
        }
    }

    private performLocalSecurityAnalysis(code: string): CodeRabbitResponse {
        const issues: SecurityIssue[] = [];

        // Pattern matching for common security vulnerabilities
        const securityPatterns = [
            {
                pattern: /password\s*=\s*['"]([^'"]+)['"]/gi,
                severity: 'critical' as const,
                category: 'Hardcoded Password',
                title: 'Hardcoded password detected',
                description: 'A hardcoded password was found in the code. This is a critical security issue.',
            },
            {
                pattern: /api[_-]?key\s*=\s*['"]([^'"]+)['"]/gi,
                severity: 'critical' as const,
                category: 'Hardcoded API Key',
                title: 'Hardcoded API key detected',
                description: 'An API key was found hardcoded in the source code. This should be moved to environment variables.',
            },
            {
                pattern: /SQL.*\+.*['"]/gi,
                severity: 'high' as const,
                category: 'SQL Injection Risk',
                title: 'Potential SQL injection vulnerability',
                description: 'String concatenation in SQL queries may lead to SQL injection attacks. Use parameterized queries.',
            },
            {
                pattern: /eval\(/gi,
                severity: 'critical' as const,
                category: 'Code Injection',
                title: 'Use of eval() detected',
                description: 'eval() can execute arbitrary code and is a security risk. Consider safer alternatives.',
            },
            {
                pattern: /dangerouslySetInnerHTML/gi,
                severity: 'high' as const,
                category: 'XSS Risk',
                title: 'Potential XSS vulnerability',
                description: 'dangerouslySetInnerHTML can lead to XSS attacks. Sanitize HTML content.',
            },
            {
                pattern: /process\.env\./g,
                severity: 'medium' as const,
                category: 'Environment Variables',
                title: 'Environment variable usage',
                description: 'Using environment variables. Ensure they are properly configured.',
            },
        ];

        const lines = code.split('\n');
        lines.forEach((line, index) => {
            securityPatterns.forEach(({ pattern, severity, category, title, description }) => {
                if (pattern.test(line)) {
                    issues.push({
                        severity,
                        category,
                        title,
                        description,
                        file: 'unknown',
                        line: index + 1,
                        code: line.trim(),
                    });
                }
            });
        });

        return {
            review: {
                summary: issues.length > 0
                    ? `Found ${issues.length} security issue(s)`
                    : 'No security issues detected',
                issues,
            },
        };
    }

    async generateReport(issues: SecurityIssue[]): Promise<string> {
        if (issues.length === 0) {
            return '✅ No security issues detected in the pull request.\n\nCode appears to follow security best practices.';
        }

        let report = `# Security Audit Report\n\n`;
        report += `## Summary\n\n`;
        report += `Total issues found: ${issues.length}\n\n`;

        // Group by severity
        const bySeverity = {
            critical: issues.filter((i) => i.severity === 'critical'),
            high: issues.filter((i) => i.severity === 'high'),
            medium: issues.filter((i) => i.severity === 'medium'),
            low: issues.filter((i) => i.severity === 'low'),
            info: issues.filter((i) => i.severity === 'info'),
        };

        report += `- Critical: ${bySeverity.critical.length}\n`;
        report += `- High: ${bySeverity.high.length}\n`;
        report += `- Medium: ${bySeverity.medium.length}\n`;
        report += `- Low: ${bySeverity.low.length}\n`;
        report += `- Info: ${bySeverity.info.length}\n\n`;

        report += `## Detailed Issues\n\n`;

        // Sort by severity (critical first)
        const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
        const sortedIssues = issues.sort(
            (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
        );

        sortedIssues.forEach((issue, index) => {
            report += `### ${index + 1}. ${issue.title} (${issue.severity.toUpperCase()})\n\n`;
            report += `**Category:** ${issue.category}\n\n`;
            report += `**Location:** ${issue.file}:${issue.line}\n\n`;
            report += `**Description:** ${issue.description}\n\n`;
            report += `\`\`\`\n${issue.code}\n\`\`\`\n\n`;
            report += `---\n\n`;
        });

        return report;
    }
}

