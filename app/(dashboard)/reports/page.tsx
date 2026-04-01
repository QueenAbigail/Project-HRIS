import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileBarChart, Download, Calendar, Users, Clock, Wallet } from 'lucide-react'

const reports = [
  {
    title: 'Attendance Report',
    description: 'Monthly attendance summary for all departments',
    icon: Clock,
    date: 'Last generated: Mar 28, 2026',
  },
  {
    title: 'Payroll Report',
    description: 'Salary and compensation breakdown',
    icon: Wallet,
    date: 'Last generated: Mar 25, 2026',
  },
  {
    title: 'Employee Report',
    description: 'Staff headcount and demographics',
    icon: Users,
    date: 'Last generated: Mar 20, 2026',
  },
  {
    title: 'Leave Report',
    description: 'Leave utilization and balance summary',
    icon: Calendar,
    date: 'Last generated: Mar 15, 2026',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download HR reports
          </p>
        </div>
        <Button>
          <FileBarChart className="mr-2 size-4" />
          Generate Custom Report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <report.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{report.date}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 size-3" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 size-3" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
