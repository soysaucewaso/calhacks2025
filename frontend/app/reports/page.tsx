import { DynamicReportTable } from '@/components/reports/dynamic-report-table'

export default function ReportsPage() {
  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Reports</h1>
          <p className="text-muted-foreground">View and analyze penetration testing reports.</p>
        </div>
      </div>
      
      <DynamicReportTable />
    </div>
  )
}
