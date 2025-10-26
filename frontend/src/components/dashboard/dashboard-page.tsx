import { StatsCards } from "./stats-cards";
import { RecentFindings } from "./recent-findings";
import { ActiveRun } from "./active-run";
import { LogsPanel } from "./logs-panel";
import { SeverityChart } from "./severity-chart";
import { VulnerabilityTrend } from "./vulnerability-trend";

export function DashboardPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to your security dashboard.</p>
                </div>
            </div>
            
            <StatsCards />

            {/* Vulnerability Trend Chart */}
            <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Vulnerability Trend (7 Days)</h2>
                <VulnerabilityTrend />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RecentFindings />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <ActiveRun />
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
                        <SeverityChart />
                    </div>
                </div>
            </div>

            <LogsPanel />
        </div>
    )
}
