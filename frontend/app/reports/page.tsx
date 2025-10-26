'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, XCircle, Activity, Shield, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react'

interface ReportData {
  id: string
  createdAt: string
  benchmark: string
  targets: string[]
  report: {
    results: Array<{
      constraint: string
      section: string
      description: string
      strategy: string
      status: 'PASS' | 'FAIL' | 'NOT TESTABLE'
      evidence: string | null
      commands: string[] | null
    }>
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/data/reports.json')
      const data = await response.json()
      setReports(data)
      if (data.length > 0) setSelectedReport(data[0])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setLoading(false)
    }
  }

  const getStats = (report: ReportData) => {
    const results = report.report.results
    return {
      total: results.length,
      pass: results.filter(r => r.status === 'PASS').length,
      fail: results.filter(r => r.status === 'FAIL').length,
      notTestable: results.filter(r => r.status === 'NOT TESTABLE').length,
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-100 text-green-800 border-green-300'
      case 'FAIL': return 'bg-red-100 text-red-800 border-red-300'
      case 'NOT TESTABLE': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAIL': return <XCircle className="h-4 w-4 text-red-600" />
      case 'NOT TESTABLE': return <AlertCircle className="h-4 w-4 text-gray-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getSectionColor = (section: string) => {
    const sections: { [key: string]: string } = {
      'Access Control': 'bg-blue-100 text-blue-800',
      'Crypto Failures': 'bg-purple-100 text-purple-800',
      'Code Injection': 'bg-orange-100 text-orange-800',
      'Design Flaws': 'bg-pink-100 text-pink-800',
      'Config Errors': 'bg-yellow-100 text-yellow-800',
      'Auth Failures': 'bg-indigo-100 text-indigo-800',
      'Integrity Failures': 'bg-red-100 text-red-800',
      'Logging Failures': 'bg-cyan-100 text-cyan-800',
      'SSRF Vectors': 'bg-teal-100 text-teal-800',
      'Outdated Components': 'bg-amber-100 text-amber-800',
    }
    return sections[section] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Security Reports Dashboard</h1>
          <p className="text-muted-foreground">Live penetration testing analysis and vulnerability assessment</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Report Selector */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Reports ({reports.length})
              </CardTitle>
              <CardDescription>Select a report to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.map((report) => (
                  <Button
                    key={report.id}
                    variant={selectedReport?.id === report.id ? 'default' : 'outline'}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div>
                      <div className="font-semibold">{report.benchmark}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Dashboard Content */}
        {selectedReport && (
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{getStats(selectedReport).total}</p>
                      <p className="text-sm text-muted-foreground">Total Tests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{getStats(selectedReport).pass}</p>
                      <p className="text-sm text-muted-foreground">Passed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{getStats(selectedReport).fail}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{getStats(selectedReport).notTestable}</p>
                      <p className="text-sm text-muted-foreground">Not Testable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Benchmark</p>
                    <p className="font-semibold">{selectedReport.benchmark}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Targets</p>
                    <p className="font-semibold">{selectedReport.targets.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test ID</p>
                    <p className="font-semibold">{selectedReport.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Detailed security assessment results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedReport.report.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{result.constraint}</h4>
                            <Badge className={getStatusColor(result.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(result.status)}
                                {result.status}
                              </div>
                            </Badge>
                          </div>
                          <Badge variant="outline" className={getSectionColor(result.section)}>
                            {result.section}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                      {result.evidence && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <p className="font-semibold mb-1">Evidence:</p>
                          <p className="line-clamp-2">{result.evidence}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
