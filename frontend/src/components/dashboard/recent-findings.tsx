import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SeverityBadge, type Severity } from "../shared/severity-badge";
import { Badge } from "../ui/badge";

type Finding = {
  id: string;
  finding: string;
  severity: Severity;
  owasp: string;
  date: string;
};

const mockFindings: Finding[] = [
  { id: "1", finding: "Cross-Site Scripting (XSS)", severity: "High", owasp: "A03:2021", date: "2 hours ago" },
  { id: "2", finding: "Insecure Direct Object References", severity: "Medium", owasp: "A01:2021", date: "5 hours ago" },
  { id: "3", finding: "Sensitive Data Exposure", severity: "High", owasp: "A02:2021", date: "1 day ago" },
  { id: "4", finding: "Missing Function Level Access Control", severity: "Medium", owasp: "A01:2021", date: "2 days ago" },
  { id: "5", finding: "Security Misconfiguration", severity: "Low", owasp: "A05:2021", date: "3 days ago" },
];

export function RecentFindings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Findings</CardTitle>
        <CardDescription>A summary of the latest security findings from all runs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Finding</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>OWASP</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFindings.map((finding) => (
              <TableRow key={finding.id}>
                <TableCell className="font-medium">{finding.finding}</TableCell>
                <TableCell>
                  <SeverityBadge severity={finding.severity} />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{finding.owasp}</Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{finding.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
