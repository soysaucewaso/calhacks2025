import axios from 'axios';

/**
 * Standalone CodeRabbit REST API Client
 * For direct integration without VS Code dependencies
 */

interface CodeRabbitRequest {
    code: string;
    context?: {
        owner?: string;
        repo?: string;
        branch?: string;
        prNumber?: number;
        file_path?: string;
    };
    settings?: {
        focus?: Array<'security' | 'best-practices' | 'performance' | 'accessibility'>;
        language?: 'auto' | 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'rust';
        strict?: boolean;
    };
}

interface CodeRabbitIssue {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    title: string;
    description: string;
    file: string;
    line: number;
    code: string;
    suggestion?: string;
}

interface CodeRabbitResponse {
    review: {
        summary: string;
        issues: CodeRabbitIssue[];
    };
    metadata?: {
        timestamp: string;
        analysis_duration: number;
        language_detected: string;
    };
}

export class CodeRabbitRESTClient {
    private apiKey: string;
    private baseUrl: string;
    private timeout: number;

    constructor(apiKey: string, baseUrl = 'https://api.coderabbit.ai') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.timeout = 60000; // 60 seconds
    }

    /**
     * Analyze code for security vulnerabilities via CodeRabbit REST API
     * @param code The code to analyze
     * @param options Additional options for analysis
     * @returns Promise with analysis results
     */
    async analyzeCode(
        code: string,
        options?: {
            focus?: Array<'security' | 'best-practices' | 'performance' | 'accessibility'>;
            language?: string;
            context?: Record<string, any>;
        }
    ): Promise<CodeRabbitResponse> {
        try {
            const payload: CodeRabbitRequest = {
                code,
                settings: {
                    focus: options?.focus || ['security', 'best-practices'],
                    language: (options?.language as any) || 'auto',
                    strict: true,
                },
                context: options?.context,
            };

            const response = await axios.post<CodeRabbitResponse>(
                `${this.baseUrl}/v1/analyze`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: this.timeout,
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('CodeRabbit API Error:', error.response?.data || error.message);
            
            // Fallback to local security analysis
            return this.performLocalSecurityAnalysis(code);
        }
    }

    /**
     * Analyze multiple files in batch
     * @param files Array of file contents with paths
     * @returns Array of analysis results
     */
    async analyzeFiles(
        files: Array<{ path: string; content: string }>,
        focus: Array<'security' | 'best-practices' | 'performance' | 'accessibility'> = ['security']
    ): Promise<Array<{ file: string; issues: CodeRabbitIssue[] }>> {
        const results = await Promise.all(
            files.map(async (file) => {
                try {
                    const analysis = await this.analyzeCode(file.content, {
                        focus,
                        context: { file_path: file.path },
                    });
                    return {
                        file: file.path,
                        issues: analysis.review.issues,
                    };
                } catch (error) {
                    console.error(`Error analyzing ${file.path}:`, error);
                    return { file: file.path, issues: [] };
                }
            })
        );

        return results;
    }

    /**
     * Perform local security analysis as fallback
     */
    private performLocalSecurityAnalysis(code: string): CodeRabbitResponse {
        const issues: CodeRabbitIssue[] = [];
        const securityPatterns = [
            {
                pattern: /password\s*=\s*['"]([^'"]+)['"]/gi,
                severity: 'critical' as const,
                category: 'Hardcoded Password',
                title: 'Hardcoded password detected',
                description: 'A hardcoded password was found in the code. This is a critical security issue.',
                suggestion: 'Move credentials to environment variables or secure vault',
            },
            {
                pattern: /api[_-]?key\s*=\s*['"]([^'"]+)['"]/gi,
                severity: 'critical' as const,
                category: 'Hardcoded API Key',
                title: 'Hardcoded API key detected',
                description: 'An API key was found hardcoded in the source code.',
                suggestion: 'Use environment variables or secrets management',
            },
            {
                pattern: /(select|SELECT).*\+(.*\+.*['"].*['"])/gi,
                severity: 'high' as const,
                category: 'SQL Injection Risk',
                title: 'Potential SQL injection vulnerability',
                description: 'String concatenation in SQL queries may lead to SQL injection attacks.',
                suggestion: 'Use parameterized queries or prepared statements',
            },
            {
                pattern: /eval\(/gi,
                severity: 'critical' as const,
                category: 'Code Injection',
                title: 'Use of eval() detected',
                description: 'eval() can execute arbitrary code and is a security risk.',
                suggestion: 'Use JSON.parse() or safer alternatives',
            },
            {
                pattern: /dangerouslySetInnerHTML/gi,
                severity: 'high' as const,
                category: 'XSS Risk',
                title: 'Potential XSS vulnerability',
                description: 'dangerouslySetInnerHTML can lead to XSS attacks.',
                suggestion: 'Sanitize HTML content or use React.createElement',
            },
            {
                pattern: /http:\/\//g,
                severity: 'medium' as const,
                category: 'Insecure Protocol',
                title: 'HTTP protocol detected',
                description: 'HTTP is not encrypted and can be intercepted.',
                suggestion: 'Use HTTPS instead',
            },
            {
                pattern: /md5\(|sha1\(/gi,
                severity: 'high' as const,
                category: 'Weak Hashing',
                title: 'Weak hashing algorithm detected',
                description: 'MD5 and SHA1 are cryptographically broken.',
                suggestion: 'Use SHA-256 or bcrypt for passwords',
            },
            {
                pattern: /\.innerHTML\s*=\s*['"]/g,
                severity: 'high' as const,
                category: 'XSS Risk',
                title: 'Direct innerHTML assignment',
                description: 'Direct innerHTML assignment can lead to XSS.',
                suggestion: 'Sanitize user input or use textContent',
            },
        ];

        const lines = code.split('\n');
        lines.forEach((line, index) => {
            securityPatterns.forEach(({ pattern, severity, category, title, description, suggestion }) => {
                if (pattern.test(line)) {
                    issues.push({
                        severity,
                        category,
                        title,
                        description,
                        file: 'unknown',
                        line: index + 1,
                        code: line.trim(),
                        suggestion,
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
            metadata: {
                timestamp: new Date().toISOString(),
                analysis_duration: 0,
                language_detected: 'auto',
            },
        };
    }

    /**
     * Generate a formatted report from analysis results
     */
    generateReport(analysis: CodeRabbitResponse): string {
        const { issues, summary } = analysis.review;
        
        if (issues.length === 0) {
            return `# Security Analysis Report\n\n✅ ${summary}\n\nCode follows security best practices.`;
        }

        let report = `# Security Analysis Report\n\n`;
        report += `## Summary\n\n${summary}\n\n`;
        report += `**Total Issues:** ${issues.length}\n\n`;

        // Group by severity
        const bySeverity = {
            critical: issues.filter(i => i.severity === 'critical'),
            high: issues.filter(i => i.severity === 'high'),
            medium: issues.filter(i => i.severity === 'medium'),
            low: issues.filter(i => i.severity === 'low'),
            info: issues.filter(i => i.severity === 'info'),
        };

        report += `### Severity Breakdown\n\n`;
        report += `- 🔴 Critical: ${bySeverity.critical.length}\n`;
        report += `- 🟠 High: ${bySeverity.high.length}\n`;
        report += `- 🟡 Medium: ${bySeverity.medium.length}\n`;
        report += `- 🔵 Low: ${bySeverity.low.length}\n`;
        report += `- ℹ️  Info: ${bySeverity.info.length}\n\n`;

        report += `---\n\n## Detailed Issues\n\n`;

        // Sort by severity
        const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
        const sortedIssues = issues.sort(
            (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
        );

        sortedIssues.forEach((issue, index) => {
            const severityEmoji = {
                critical: '🔴',
                high: '🟠',
                medium: '🟡',
                low: '🔵',
                info: 'ℹ️',
            };

            report += `### ${index + 1}. ${severityEmoji[issue.severity]} ${issue.title} [${issue.severity.toUpperCase()}]\n\n`;
            report += `**Category:** ${issue.category}\n\n`;
            report += `**File:** ${issue.file}:${issue.line}\n\n`;
            report += `**Description:** ${issue.description}\n\n`;
            
            if (issue.suggestion) {
                report += `**Recommendation:** ${issue.suggestion}\n\n`;
            }
            
            report += `**Code:**\n\`\`\`${this.detectLanguage(issue.code)}\n${issue.code}\n\`\`\`\n\n`;
            report += `---\n\n`;
        });

        return report;
    }

    private detectLanguage(code: string): string {
        if (code.includes('import ') || code.includes('export ') || code.includes('function')) {
            return 'javascript';
        }
        if (code.includes('def ') || code.includes('import ')) {
            return 'python';
        }
        if (code.includes('SELECT') || code.includes('FROM')) {
            return 'sql';
        }
        return 'text';
    }
}

// Export for use in other files
export default CodeRabbitRESTClient;

