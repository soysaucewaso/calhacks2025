"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface ReportItem {
  constraint: string;
  status: "PASS" | "FAIL" | "NOT TESTABLE";
  evidence: string;
  commands: string[];
}

interface ReportData {
  report: ReportItem[];
  target: string;
  benchmark: string;
  generatedAt: string;
}

export function DynamicReportTable() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: 'Juice Shop',
          benchmark: 'PCI DSS'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "NOT TESTABLE":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASS":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">PASS</Badge>;
      case "FAIL":
        return <Badge variant="destructive">FAIL</Badge>;
      case "NOT TESTABLE":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">NOT TESTABLE</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Generating report...</span>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">No report data available</p>
          <Button onClick={generateReport} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Compliance Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(reportData.generatedAt).toLocaleDateString()} - {reportData.benchmark} Testing
            </p>
            <p className="text-sm text-muted-foreground">
              Target: {reportData.target}
            </p>
          </div>
          <Button onClick={generateReport} disabled={loading} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Constraint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Commands Executed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.report.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.constraint}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {getStatusBadge(item.status)}
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm text-muted-foreground">{item.evidence}</p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.commands.map((cmd, cmdIndex) => (
                      <code key={cmdIndex} className="block text-xs bg-muted p-1 rounded">
                        {cmd}
                      </code>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
