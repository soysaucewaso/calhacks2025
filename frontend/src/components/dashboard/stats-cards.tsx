import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, AlertTriangle, FileText, CheckCircle } from "lucide-react";

const stats = [
    { title: "Active Runs", value: "1", icon: Play, color: "text-primary" },
    { title: "Vulnerabilities Found (24h)", value: "3", icon: AlertTriangle, color: "text-red-400" },
    { title: "Total Reports", value: "27", icon: FileText, color: "text-violet-400" },
    { title: "Compliance", value: "98%", icon: CheckCircle, color: "text-green-400" },
];

export function StatsCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-headline">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
