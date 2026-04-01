'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'

const stats = [
  {
    title: 'Pending Requests',
    value: 23,
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    title: 'Approved This Month',
    value: 45,
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'Rejected This Month',
    value: 8,
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    title: 'On Leave Today',
    value: 11,
    icon: Calendar,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
]

export function LeaveStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
