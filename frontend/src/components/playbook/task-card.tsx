"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SeverityBadge, type Severity } from "../shared/severity-badge";
import { type SuggestPentestPlaybookTasksOutput } from "@/ai/flows/suggest-pentest-playbook-tasks";

type TaskCardProps = {
  task: SuggestPentestPlaybookTasksOutput[0];
  onApproveToggle: (title: string, approved: boolean) => void;
};

export function TaskCard({ task, onApproveToggle }: TaskCardProps) {
  const [isApproved, setIsApproved] = useState(false);

  const handleCheckedChange = (checked: boolean) => {
    setIsApproved(checked);
    onApproveToggle(task.title, checked);
  };

  const confidencePercentage = task.confidenceScore * 100;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold font-headline">{task.title}</h3>
              <SeverityBadge severity={task.estimatedSeverity as Severity} />
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          <div className="flex sm:flex-col items-end gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center space-x-2">
              <Switch
                id={`approve-${task.title}`}
                checked={isApproved}
                onCheckedChange={handleCheckedChange}
              />
              <Label htmlFor={`approve-${task.title}`} className="text-sm font-medium">
                Approve
              </Label>
            </div>
            <div className="w-24 text-right">
                <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                <Progress value={confidencePercentage} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
