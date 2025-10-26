'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Activity, Cloud, Server, Globe } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const freebsdVulnerabilities = [
  {
    cve: 'CVE-2024-43102',
    severity: 'Critical',
    description: 'UMTX_SHM_DESTROY concurrent removals of shared memory mappings',
    impact: 'Kernel Panic / Use-After-Free',
    score: 10.0
  },
  {
    cve: 'CVE-2023-5941',
    severity: 'Critical',
    description: '__sflush() function heap buffer overflow on write errors',
    impact: 'Remote Code Execution',
    score: 9.8
  },
  {
    cve: 'CVE-2024-43110',
    severity: 'High',
    description: 'ctl_request_sense exposes kernel heap memory to userspace',
    impact: 'Code Execution / Memory Disclosure',
    score: 8.8
  },
  {
    cve: 'CVE-2023-3494',
    severity: 'High',
    description: 'Buffer overflow vulnerability in fwctl driver',
    impact: 'Malicious Code Execution',
    score: 8.8
  },
  {
    cve: 'CVE-2024-42600',
    severity: 'High',
    description: 'Insufficient validation in USB code leads to out-of-bounds write',
    impact: 'Memory Corruption',
    score: 8.2
  }
]

const severityData = [
  { name: 'Critical', value: 2, color: '#ef4444' },
  { name: 'High', value: 3, color: '#f97316' },
  { name: 'Medium', value: 0, color: '#eab308' },
  { name: 'Low', value: 0, color: '#84cc16' }
]

const cveScoreData = freebsdVulnerabilities.map(v => ({
  name: v.cve,
  score: v.score
}))

const infraInfo = {
  title: 'AuzLandRE',
  httpServer: 'Amazon S3',
  ipAddress: '3.170.19.84',
  country: 'United States',
  cdn: 'CloudFront',
  os: 'FreeBSD 13.1-RELEASE',
  ports: ['80 (HTTP)', '443 (HTTPS)'],
  nameservers: ['ns-1004.awsdns-61.net', 'ns-1153.awsdns-16.org', 'ns-124.awsdns-15.com', 'ns-1726.awsdns-23.co.uk'],
  registrar: 'GoDaddy.com',
  registrant: 'AbhikashSingh Chauhan'
}

export function AuzLandREDashboard() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="grid gap-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{freebsdVulnerabilities.length}</p>
                <p className="text-sm text-muted-foreground">Known CVEs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Server className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">FreeBSD 13.1</p>
                <p className="text-sm text-muted-foreground">OS Version</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Cloud className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">AWS</p>
                <p className="text-sm text-muted-foreground">Infrastructure</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">15+ Days</p>
                <p className="text-sm text-muted-foreground">Since Last CVE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Infrastructure Analysis
          </CardTitle>
          <CardDescription>Hosting environment and network configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Application Name</p>
                <p className="font-semibold">{infraInfo.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">HTTP Server</p>
                <p className="font-semibold">{infraInfo.httpServer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">CDN Provider</p>
                <Badge variant="outline" className="bg-blue-50">
                  <Cloud className="h-3 w-3 mr-1" />
                  {infraInfo.cdn}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Operating System</p>
                <Badge variant="destructive">{infraInfo.os}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">IP Address</p>
                <p className="font-semibold">{infraInfo.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Country</p>
                <p className="font-semibold">{infraInfo.country}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registrar</p>
                <p className="font-semibold">{infraInfo.registrar}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Ports</p>
                <div className="flex gap-2">
                  {infraInfo.ports.map((port, idx) => (
                    <Badge key={idx} variant="outline">{port}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            FreeBSD 13.1 Vulnerability Distribution by Severity
          </CardTitle>
          <CardDescription>Known security vulnerabilities in this OS version</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cveScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-muted-foreground mt-2 text-center">CVSS Base Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CVE Details */}
      <Card>
        <CardHeader>
          <CardTitle>Known Vulnerabilities (FreeBSD 13.1)</CardTitle>
          <CardDescription>Critical security flaws requiring OS updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {freebsdVulnerabilities.map((vuln, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{vuln.cve}</h4>
                      <Badge className={getSeverityBadge(vuln.severity)}>
                        {vuln.severity}
                      </Badge>
                      <Badge variant="outline" className="ml-1">
                        CVSS: {vuln.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600">Impact: {vuln.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className="border-orange-300 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="h-5 w-5" />
            Infrastructure Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="font-semibold text-orange-900">Infrastructure Observations:</p>
            <div className="grid gap-2 text-sm">
              <div className="flex items-start gap-2">
                <Badge className="bg-green-100 text-green-800">✓</Badge>
                <p><strong>CloudFront CDN:</strong> Excellent choice for performance and DDoS protection</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-green-100 text-green-800">✓</Badge>
                <p><strong>Amazon S3:</strong> Scalable hosting solution</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-red-100 text-red-800">✗</Badge>
                <p><strong>FreeBSD 13.1:</strong> Multiple critical CVEs requiring immediate OS update</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-red-100 text-red-800">✗</Badge>
                <p><strong>DNSSEC:</strong> Not enabled, reducing DNS security</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded border border-orange-300">
            <p className="font-semibold text-sm mb-1">Recommended Actions:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Update FreeBSD to latest stable version (14.x or later)</li>
              <li>Enable DNSSEC for enhanced DNS security</li>
              <li>Implement Web Application Firewall (WAF) rules in CloudFront</li>
              <li>Regular security audits and penetration testing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

