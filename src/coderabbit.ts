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
            // Use CodeRabbit API v1/review endpoint with repo URL
            const repoUrl = `https://github.com/${owner}/${repo}`;
            const response = await axios.post(
                'https://api.coderabbit.ai/v1/review',
                {
                    repo_url: repoUrl,
                    pr_number: prNumber,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Transform CodeRabbit response to our SecurityIssue format
            if (response.data && response.data.issues) {
                return response.data.issues.map((issue: any) => ({
                    severity: issue.severity || this.mapSeverity(issue.level),
                    category: issue.category || issue.type || 'Security',
                    title: issue.title || issue.message || 'Security issue',
                    description: issue.description || issue.message || 'No description provided',
                    file: issue.file_path || issue.file || 'unknown',
                    line: issue.line_number || issue.line || 0,
                    code: issue.code_snippet || issue.code || '',
                }));
            }

            // Fallback: perform local analysis
            const { data: pr } = await this.octokit.pulls.get({
                owner,
                repo,
                pull_number: prNumber,
            });

            // Fetch the diff for local analysis
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

            const diffData = typeof diffResponse.data === 'string' ? diffResponse.data : JSON.stringify(diffResponse.data);
            const analysis = this.performLocalSecurityAnalysis(diffData);
            return analysis.review.issues;

        } catch (error: any) {
            console.error('Error analyzing pull request:', error.response?.data || error.message);
            
            // Fallback to local analysis
            try {
                const diffResponse = await this.octokit.request(
                    `GET /repos/${owner}/${repo}/pulls/${prNumber}`,
                    {
                        mediaType: { format: 'diff' },
                        headers: { accept: 'application/vnd.github.v3.diff' },
                    }
                );
                const diffData = typeof diffResponse.data === 'string' ? diffResponse.data : JSON.stringify(diffResponse.data);
                const analysis = this.performLocalSecurityAnalysis(diffData);
                return analysis.review.issues;
            } catch (fallbackError) {
                throw error;
            }
        }
    }

    private mapSeverity(level: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
        const mapping: Record<string, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
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

    private async analyzeCodeViaCodeRabbit(
        repoUrl: string,
        prNumber: number
    ): Promise<CodeRabbitResponse> {
        try {
            const response = await axios.post(
                'https://api.coderabbit.ai/v1/review',
                {
                    repo_url: repoUrl,
                    pr_number: prNumber,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('CodeRabbit API error:', error.response?.data || error.message);
            throw error;
        }
    }

    private performLocalSecurityAnalysis(code: string): CodeRabbitResponse {
        const issues: SecurityIssue[] = [];

        // Pattern matching for common security vulnerabilities
        const securityPatterns = [
            // Hardcoded credentials
            {
                pattern: /(password|pass|pwd)\s*=\s*['"]([^'"]+)['"]/gi,
                severity: 'critical' as const,
                category: 'Hardcoded Secrets/Passwords',
                title: 'Hardcoded password detected',
                description: 'A hardcoded password was found in the code. This is a critical security issue.',
            },
            {
                pattern: /(api[_-]?key|apikey|secret|token)\s*=\s*['"]([^'"]+)['"]/gi,
                severity: 'critical' as const,
                category: 'Hardcoded Secrets/Passwords',
                title: 'Hardcoded secret detected',
                description: 'An API key or secret was found hardcoded in the source code. This should be moved to environment variables.',
            },
            {
                pattern: /(aws[_-]?secret[_-]?key|aws[_-]?access[_-]?key)/gi,
                severity: 'critical' as const,
                category: 'Hardcoded Secrets/Passwords',
                title: 'AWS credentials detected',
                description: 'AWS credentials found in code. Use IAM roles or environment variables instead.',
            },
            // SQL Injection
            {
                pattern: /(SELECT|INSERT|UPDATE|DELETE).*\+(.*\+.*['"])/gi,
                severity: 'high' as const,
                category: 'SQL Injection',
                title: 'Potential SQL injection vulnerability',
                description: 'String concatenation in SQL queries may lead to SQL injection attacks. Use parameterized queries.',
            },
            {
                pattern: /(SELECT|INSERT|UPDATE|DELETE).*['"].*\$\{/gi,
                severity: 'high' as const,
                category: 'SQL Injection',
                title: 'SQL injection risk with template literals',
                description: 'Template literals in SQL queries without parameterization are vulnerable to SQL injection.',
            },
            // Code Injection
            {
                pattern: /eval\(/gi,
                severity: 'critical' as const,
                category: 'Code Injection',
                title: 'Use of eval() detected',
                description: 'eval() can execute arbitrary code and is a security risk. Consider safer alternatives.',
            },
            {
                pattern: /Function\(/gi,
                severity: 'high' as const,
                category: 'Code Injection',
                title: 'Potential code injection via Function constructor',
                description: 'Function constructor can execute arbitrary code. Use safer alternatives.',
            },
            // XSS
            {
                pattern: /dangerouslySetInnerHTML/gi,
                severity: 'high' as const,
                category: 'XSS',
                title: 'Potential XSS vulnerability',
                description: 'dangerouslySetInnerHTML can lead to XSS attacks. Sanitize HTML content.',
            },
            {
                pattern: /\.innerHTML\s*=\s*['"]/g,
                severity: 'high' as const,
                category: 'XSS',
                title: 'Direct innerHTML assignment',
                description: 'Direct innerHTML assignment with user input can lead to XSS attacks.',
            },
            // Insecure practices
            {
                pattern: /http:\/\//g,
                severity: 'medium' as const,
                category: 'Insecure Communication',
                title: 'HTTP protocol detected',
                description: 'HTTP is not encrypted and data can be intercepted. Use HTTPS instead.',
            },
            {
                pattern: /(md5|sha1)\(/gi,
                severity: 'high' as const,
                category: 'Weak Cryptography',
                title: 'Weak hashing algorithm detected',
                description: 'MD5 and SHA1 are cryptographically broken. Use SHA-256 or bcrypt.',
            },
            // Error handling
            {
                pattern: /catch\s*\(\s*e\s*\)\s*\{\s*\}/g,
                severity: 'medium' as const,
                category: 'Missing Error Handling',
                title: 'Empty catch block',
                description: 'Empty catch blocks hide errors and make debugging difficult.',
            },
            {
                pattern: /console\.log\(/g,
                severity: 'low' as const,
                category: 'Logging Issues',
                title: 'console.log in production code',
                description: 'console.log statements should be removed or replaced with proper logging in production.',
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

        let report = `# 🔒 Security Audit Report\n\n`;
        
        // Generate summary similar to CodeRabbit
        report += await this.generateCodeRabbitStyleSummary(issues);

        report += `\n## 📋 Detailed Issues\n\n`;

        // Group by vulnerability type for better organization
        const byCategory = this.groupByCategory(issues);

        // Sort by severity (critical first)
        const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
        const sortedIssues = issues.sort(
            (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
        );

        let issueNumber = 1;
        for (const category of Object.keys(byCategory)) {
            const categoryIssues = byCategory[category];
            report += `### ${category}\n\n`;
            
            categoryIssues.forEach((issue) => {
                const severityIcon = this.getSeverityIcon(issue.severity);
                report += `#### ${issueNumber}. ${severityIcon} ${issue.title}\n\n`;
                report += `**Severity:** ${issue.severity.toUpperCase()}\n`;
                report += `**Location:** \`${issue.file}:${issue.line}\`\n\n`;
                report += `**Description:** ${issue.description}\n\n`;
                
                if (issue.code && issue.code.trim()) {
                    report += `**Vulnerable Code:**\n\`\`\`\n${issue.code}\`\`\`\n\n`;
                }
                
                // Add fix suggestion
                const fixSuggestion = this.generateFixSuggestion(issue);
                if (fixSuggestion) {
                    report += `**💡 Fix Suggestion:**\n${fixSuggestion}\n\n`;
                }
                
                report += `---\n\n`;
                issueNumber++;
            });
        }

        return report;
    }

    private async generateCodeRabbitStyleSummary(issues: SecurityIssue[]): Promise<string> {
        const totalIssues = issues.length;
        
        // Count issues by severity
        const bySeverity = {
            critical: issues.filter((i) => i.severity === 'critical'),
            high: issues.filter((i) => i.severity === 'high'),
            medium: issues.filter((i) => i.severity === 'medium'),
            low: issues.filter((i) => i.severity === 'low'),
            info: issues.filter((i) => i.severity === 'info'),
        };

        // Count unique files
        const uniqueFiles = new Set(issues.map(i => i.file));
        const fileCount = uniqueFiles.size;

        // Count by vulnerability category
        const byCategory = {
            'SQL Injection': issues.filter(i => i.category.toLowerCase().includes('sql') || i.title.toLowerCase().includes('sql')),
            'Hardcoded Secrets/Passwords': issues.filter(i => i.category.toLowerCase().includes('password') || i.category.toLowerCase().includes('key') || i.category.toLowerCase().includes('secret')),
            'Code Injection': issues.filter(i => i.category.toLowerCase().includes('injection') || i.category.toLowerCase().includes('eval')),
            'XSS': issues.filter(i => i.category.toLowerCase().includes('xss')),
            'Error Handling': issues.filter(i => i.category.toLowerCase().includes('error')),
            'Logging Issues': issues.filter(i => i.title.toLowerCase().includes('console.log') || i.code.toLowerCase().includes('console.log')),
        };

        let summary = `## Summary\n\n`;
        summary += `**${totalIssues} issues across ${fileCount} file${fileCount !== 1 ? 's' : ''}**\n\n`;
        
        // Build severity breakdown
        const severityBreakdown: string[] = [];
        
        if (bySeverity.critical.length > 0) {
            const categories = this.getTopCategories(bySeverity.critical);
            severityBreakdown.push(`${bySeverity.critical.length} critical${this.formatCategories(categories)}`);
        }
        if (bySeverity.high.length > 0) {
            const categories = this.getTopCategories(bySeverity.high);
            severityBreakdown.push(`${bySeverity.high.length} high${this.formatCategories(categories)}`);
        }
        if (bySeverity.medium.length > 0) {
            const categories = this.getTopCategories(bySeverity.medium);
            severityBreakdown.push(`${bySeverity.medium.length} medium${this.formatCategories(categories)}`);
        }
        if (bySeverity.low.length > 0) {
            const categories = this.getTopCategories(bySeverity.low);
            severityBreakdown.push(`${bySeverity.low.length} low${this.formatCategories(categories)}`);
        }
        
        summary += severityBreakdown.join('\n');
        summary += '\n';

        return summary;
    }

    private getTopCategories(issues: SecurityIssue[]): string[] {
        const categoryCount: Record<string, number> = {};
        issues.forEach(issue => {
            categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
        });
        
        return Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([category]) => category);
    }

    private formatCategories(categories: string[]): string {
        if (categories.length === 0) return '';
        if (categories.length === 1) return ` (${categories[0]})`;
        return ` (${categories.join(', ')})`;
    }

    private groupByCategory(issues: SecurityIssue[]): Record<string, SecurityIssue[]> {
        const grouped: Record<string, SecurityIssue[]> = {};
        issues.forEach(issue => {
            if (!grouped[issue.category]) {
                grouped[issue.category] = [];
            }
            grouped[issue.category].push(issue);
        });
        return grouped;
    }

    private getSeverityIcon(severity: string): string {
        const icons: Record<string, string> = {
            'critical': '🔴',
            'high': '🟠',
            'medium': '🟡',
            'low': '🔵',
            'info': 'ℹ️',
        };
        return icons[severity] || '⚠️';
    }

    private generateFixSuggestion(issue: SecurityIssue): string {
        const suggestions: Record<string, string> = {
            'Hardcoded Password': 'Use environment variables or a secrets management system:\n```\nconst password = process.env.DB_PASSWORD;\n```',
            'Hardcoded API Key': 'Store API keys in environment variables or a secure vault:\n```\nconst apiKey = process.env.API_KEY;\n```',
            'SQL Injection Risk': 'Use parameterized queries:\n```\nconst query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [userId]);\n```',
            'Code Injection': 'Avoid using eval(). Use JSON.parse() or proper parsing:\n```\nconst result = JSON.parse(userInput);\n```',
            'XSS Risk': 'Sanitize user input or use textContent instead of innerHTML:\n```\nelement.textContent = userInput;\n// or use DOMPurify.sanitize(userInput)\n```',
            'Environment Variables': 'Ensure environment variables are properly loaded using dotenv or similar.',
        };

        // Check if we have a specific suggestion
        for (const [key, suggestion] of Object.entries(suggestions)) {
            if (issue.category.includes(key) || issue.title.includes(key)) {
                return suggestion;
            }
        }

        return `Review this code for security best practices. Consider:\n- Input validation\n- Output encoding\n- Secure coding patterns\n- Dependency updates`;
    }
}

