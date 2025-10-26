"use client";

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
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ReportItem {
  constraint: string;
  status: "PASS" | "FAIL" | "NOT TESTABLE";
  evidence: string;
  commands: string[];
}

const mockReportData: ReportItem[] = [
  {
    constraint: "Network Security Controls",
    status: "PASS",
    evidence: "Firewall properly configured, no unauthorized access detected",
    commands: ["nmap -sS 192.168.1.1", "netstat -tuln"]
  },
  {
    constraint: "Data Protection Mechanisms",
    status: "FAIL",
    evidence: "Sensitive data found in plaintext logs",
    commands: ["grep -r 'password' /var/log/", "find /tmp -name '*.txt'"]
  },
  {
    constraint: "Access Control Testing",
    status: "NOT TESTABLE",
    evidence: "Target system not accessible for testing",
    commands: ["ping 192.168.1.100", "telnet 192.168.1.100 22"]
  },
  {
    constraint: "Authentication Mechanisms",
    status: "PASS",
    evidence: "Strong password policies enforced, multi-factor authentication enabled",
    commands: ["cat /etc/pam.d/common-password", "systemctl status ssh"]
  },
  {
    constraint: "Session Management",
    status: "FAIL",
    evidence: "Session tokens not properly invalidated on logout",
    commands: ["curl -I http://target/login", "grep -i session /var/log/auth.log"]
  }
];

export function ReportTable() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Report</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generated on {new Date().toLocaleDateString()} - PCI DSS Compliance Testing
        </p>
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
            {mockReportData.map((item, index) => (
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


