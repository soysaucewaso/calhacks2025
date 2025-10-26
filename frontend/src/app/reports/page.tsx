import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Reports</h1>
          <p className="text-muted-foreground">
            Access and manage all generated audit reports.
          </p>
        </div>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-12">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <History className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">No Reports Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Completed runs will generate reports here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
