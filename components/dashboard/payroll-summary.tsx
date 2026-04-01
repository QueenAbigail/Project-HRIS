'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const payrollData = [
  { label: 'Base Salary', amount: 385000, percentage: 71 },
  { label: 'Overtime', amount: 78500, percentage: 14 },
  { label: 'Allowances', amount: 52400, percentage: 10 },
  { label: 'Bonuses', amount: 26990, percentage: 5 },
]

export function PayrollSummary() {
  const total = payrollData.reduce((acc, item) => acc + item.amount, 0)

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle>Payroll Breakdown</CardTitle>
        <CardDescription>Monthly salary distribution overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-3xl font-bold">${total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Monthly Payroll</p>
        </div>
        <div className="space-y-4">
          {payrollData.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">${item.amount.toLocaleString()}</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing Date</span>
            <span className="font-medium">March 28, 2026</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Status</span>
            <span className="text-success font-medium">On Schedule</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
