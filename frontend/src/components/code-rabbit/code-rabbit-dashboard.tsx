'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, XCircle, Activity, Shield, AlertTriangle, Code2, GitBranch, Loader2, FileCode } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CodeReviewIssue {
  id: string
  type: 'security' | 'quality' | 'performance'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  file: string
  line: number
  suggestion: string
  category: string
}

interface ReviewSummary {
  totalIssues: number
  critical: number
  high: number
  medium: number
  low: number
  filesScanned: number
  overallGrade: string
}

export function CodeRabbitDashboard() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [issues, setIssues] = useState<CodeReviewIssue[]>([])
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [currentRepo, setCurrentRepo] = useState('')

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = type === 'success' ? '✓' : type === 'warn' ? '⚠' : type === 'error' ? '✗' : 'ℹ'
    setLogs(prev => [...prev, `[${timestamp}] [${type.toUpperCase()}] ${emoji} ${message}`])
  }

  const simulateCodeRabbitScan = async (repo: string) => {
    setIsScanning(true)
    addLog(`Starting CodeRabbit security scan for ${repo}...`)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    addLog('Connecting to CodeRabbit API...', 'info')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    addLog('Scanning repository structure...', 'info')
    
    // Simulate finding issues
    const mockIssues: CodeReviewIssue[] = [
      {
        id: '1',
        type: 'security',
        severity: 'critical',
        message: 'Hardcoded API key detected',
        file: 'src/config.js',
        line: 42,
        suggestion: 'Use environment variables for sensitive data',
        category: 'Credentials Exposure'
      },
      {
        id: '2',
        type: 'security',
        severity: 'high',
        message: 'SQL injection vulnerability in user input',
        file: 'src/api/users.js',
        line: 78,
        suggestion: 'Use parameterized queries to prevent SQL injection',
        category: 'Injection Attack'
      },
      {
        id: '3',
        type: 'security',
        severity: 'high',
        message: 'Missing input validation on authentication endpoint',
        file: 'src/middleware/auth.js',
        line: 15,
        suggestion: 'Implement rate limiting and input sanitization',
        category: 'Authentication Bypass'
      },
      {
        id: '4',
        type: 'quality',
        severity: 'medium',
        message: 'Unused variable in production code',
        file: 'src/utils/helpers.js',
        line: 23,
        suggestion: 'Remove unused variable to reduce code clutter',
        category: 'Code Quality'
      },
      {
        id: '5',
        type: 'security',
        severity: 'medium',
        message: 'Deprecated crypto function detected',
        file: 'src/security/hash.js',
        line: 31,
        suggestion: 'Replace with modern, secure hashing algorithm',
        category: 'Deprecated API'
      },
      {
        id: '6',
        type: 'performance',
        severity: 'low',
        message: 'Large file could be optimized',
        file: 'src/components/BigComponent.jsx',
        line: 1,
        suggestion: 'Consider code splitting for better performance',
        category: 'Performance'
      }
    ]

    await new Promise(resolve => setTimeout(resolve, 2000))
    addLog('Analyzing code for security vulnerabilities...', 'info')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    addLog(`Found 6 potential issues in codebase`, 'warn')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    addLog('Generating security recommendations...', 'info')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    addLog('Scan complete! 3 critical security issues found.', 'success')

    setIssues(mockIssues)
    setSummary({
      totalIssues: 6,
      critical: 1,
      high: 2,
      medium: 2,
      low: 1,
      filesScanned: 42,
      overallGrade: 'B'
    })
    setIsScanning(false)
  }

  const handleScan = () => {
    if (!repoUrl.trim()) {
      addLog('Please enter a valid GitHub repository URL', 'error')
      return
    }

    setCurrentRepo(repoUrl)
    setLogs([])
    simulateCodeRabbitScan(repoUrl)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    if (category.includes('Credentials') || category.includes('Injection') || category.includes('Authentication')) {
      return 'bg-red-50 text-red-700'
    }
    if (category.includes('Deprecated')) {
      return 'bg-orange-50 text-orange-700'
    }
    return 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="grid gap-6">
      {/* Scan Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            CodeRabbit Security Scanner
          </CardTitle>
          <CardDescription>
            AI-powered code review for security vulnerabilities, hardcoded credentials, SQL injection, and security best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isScanning}
            />
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Scan Repository
                </>
              )}
            </Button>
          </div>
          
          {currentRepo && (
            <Alert>
              <Code2 className="h-4 w-4" />
              <AlertDescription>
                Currently scanning: <strong>{currentRepo}</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Live Runner Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Runner Logs
            </CardTitle>
            <CardDescription>Real-time stream of logs from the active runner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-80 overflow-y-auto">
              {logs.map((log, idx) => {
                const isSuccess = log.includes('[SUCCESS]')
                const isWarn = log.includes('[WARN]')
                const isError = log.includes('[ERROR]')
                return (
                  <div
                    key={idx}
                    className={`py-1 ${
                      isSuccess ? 'text-green-400' : isWarn ? 'text-yellow-400' : isError ? 'text-red-400' : 'text-gray-400'
                    }`}
                  >
                    {log}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Dashboard */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.totalIssues}</p>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileCode className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.filesScanned}</p>
                  <p className="text-sm text-muted-foreground">Files Scanned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.overallGrade}</p>
                  <p className="text-sm text-muted-foreground">Security Grade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Issues */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Issues Found
            </CardTitle>
            <CardDescription>Detailed breakdown of vulnerabilities and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityIcon(issue.severity)}
                        <h4 className="font-semibold">{issue.message}</h4>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(issue.category)}>
                          {issue.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          <Code2 className="h-3 w-3 inline mr-1" />
                          {issue.file}
                        </span>
                        <span>
                          Line {issue.line}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <p className="font-semibold mb-1">💡 Recommendation:</p>
                    <p>{issue.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

