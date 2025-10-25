import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { Pause, Download, Eye } from "lucide-react";

export function ActiveRun() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Run: Juice Shop</CardTitle>
                <CardDescription>Full Scan initiated by admin@pentest.ai</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-medium text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="w-full" />
                </div>
                <div className="text-sm">
                    <p><span className="font-semibold">Current Task:</span> SQL Injection on login page</p>
                    <p><span className="font-semibold">Status:</span> <span className="text-primary">Running</span></p>
                    <p><span className="font-semibold">Elapsed Time:</span> 12m 34s</p>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause Scan
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Export Results
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
