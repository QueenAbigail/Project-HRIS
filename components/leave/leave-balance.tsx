'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const leaveTypes = [
  {
    type: 'Annual Leave',
    used: 12,
    total: 20,
    color: 'bg-primary',
  },
  {
    type: 'Sick Leave',
    used: 5,
    total: 14,
    color: 'bg-chart-5',
  },
  {
    type: 'Personal Leave',
    used: 2,
    total: 5,
    color: 'bg-chart-2',
  },
  {
    type: 'Emergency Leave',
    used: 1,
    total: 3,
    color: 'bg-destructive',
  },
]

const upcomingLeaves = [
  { name: 'Amanda Martinez', type: 'Annual', dates: 'Apr 7-10', days: 4 },
  { name: 'Robert Taylor', type: 'Annual', dates: 'Apr 1-5', days: 5 },
  { name: 'Jessica Brown', type: 'Sick', dates: 'Mar 31', days: 1 },
]

export function LeaveBalance() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Company Leave Balance</CardTitle>
          <CardDescription>Average leave usage across all employees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {leaveTypes.map((leave) => (
            <div key={leave.type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{leave.type}</span>
                <span className="font-medium">
                  {leave.used}/{leave.total} days
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={(leave.used / leave.total) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Upcoming Leaves</CardTitle>
          <CardDescription>Approved leaves this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingLeaves.map((leave, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{leave.name}</p>
                <p className="text-xs text-muted-foreground">{leave.type} - {leave.dates}</p>
              </div>
              <span className="text-sm text-muted-foreground">{leave.days} days</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
