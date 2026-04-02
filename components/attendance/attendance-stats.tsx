'use client'

import { Card, CardContent } from '@/components/ui/card'
import { UserCheck, UserX, Clock, AlertTriangle, CalendarOff } from 'lucide-react'
import { getOverallAttendanceStats } from '@/lib/data'

export function AttendanceStats() {
  const overallStats = getOverallAttendanceStats()

  const stats = [
    {
      title: 'Present',
      value: overallStats.presentToday,
      percentage: `${overallStats.attendanceRate}%`,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Absent',
      value: overallStats.absentToday,
      percentage: `${Math.round((overallStats.absentToday / overallStats.totalEmployees) * 100)}%`,
      icon: UserX,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Late Arrivals',
      value: overallStats.lateCheckIns,
      percentage: `${Math.round((overallStats.lateCheckIns / overallStats.totalEmployees) * 100)}%`,
      subtext: overallStats.lateCheckIns > 0 ? `Avg: ${overallStats.averageLateMinutes}min late` : undefined,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      highlight: overallStats.lateCheckIns > 0,
    },
    {
      title: 'On Leave',
      value: overallStats.onLeave,
      percentage: `${Math.round((overallStats.onLeave / overallStats.totalEmployees) * 100)}%`,
      icon: AlertTriangle,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Scheduled Off',
      value: overallStats.dayOff,
      percentage: `${Math.round((overallStats.dayOff / overallStats.totalEmployees) * 100)}%`,
      subtext: `${overallStats.expectedToWork} expected today`,
      icon: CalendarOff,
      color: 'text-primary/70',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className={`bg-card border-border ${
            'highlight' in stat && stat.highlight ? 'ring-1 ring-warning/50' : ''
          }`}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className={`text-2xl font-bold ${'highlight' in stat && stat.highlight ? stat.color : ''}`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              {'subtext' in stat && stat.subtext && (
                <p className="text-xs text-warning mt-0.5">{stat.subtext}</p>
              )}
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
