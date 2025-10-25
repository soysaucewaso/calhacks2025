import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel } from "lucide-react";

export default function CompliancePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Compliance</h1>
          <p className="text-muted-foreground">
            Track findings against compliance standards like OWASP and CIS.
          </p>
        </div>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-12">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <Gavel className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">No Compliance Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Run tests and generate reports to see compliance mappings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
