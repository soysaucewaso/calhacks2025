import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function TrainingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Training</h1>
          <p className="text-muted-foreground">
            Manage and track employee security training assignments.
          </p>
        </div>
      </div>
       <Card className="flex flex-col items-center justify-center text-center p-12">
        <CardHeader>
          <div className="mx-auto bg-secondary p-4 rounded-full">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">No Training Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Training assignments from phishing simulations will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
