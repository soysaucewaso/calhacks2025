import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Severity = "Low" | "Medium" | "High";

type SeverityBadgeProps = {
  severity: Severity;
  className?: string;
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const severityClasses = {
    Low: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
    High: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-normal", severityClasses[severity], className)}
    >
      {severity}
    </Badge>
  );
}
