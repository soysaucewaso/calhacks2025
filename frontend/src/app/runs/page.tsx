import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

export default function RunsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Runs</h1>
          <p className="text-muted-foreground">
            View past and ongoing playbook executions.
          </p>
        </div>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-12">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">No Runs Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Execute a playbook to see run history here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
