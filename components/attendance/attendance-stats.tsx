'use client'

import { Card, CardContent } from '@/components/ui/card'
import { UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react'

const stats = [
  {
    title: 'Present',
    value: 189,
    percentage: '76.5%',
    icon: UserCheck,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'Absent',
    value: 35,
    percentage: '14.2%',
    icon: UserX,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    title: 'Late Arrivals',
    value: 12,
    percentage: '4.9%',
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    title: 'On Leave',
    value: 11,
    percentage: '4.4%',
    icon: AlertTriangle,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
]

export function AttendanceStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
            <div className={`text-sm font-medium ${stat.color}`}>
              {stat.percentage}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
