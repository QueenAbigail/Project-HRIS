'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Wallet, UserCheck, UserX, MapPin, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { getOverallAttendanceStats } from '@/lib/data'
import { locations } from '@/lib/constants'

export function StatsCards() {
  const stats = getOverallAttendanceStats()

  const statsData = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees.toString(),
      change: '+12',
      changeType: 'increase' as const,
      description: 'from last month',
      icon: Users,
    },
    {
      title: 'Present Today',
      value: stats.presentToday.toString(),
      change: `${stats.attendanceRate}%`,
      changeType: 'increase' as const,
      description: 'attendance rate',
      icon: UserCheck,
    },
    {
      title: 'Absent / Not Checked In',
      value: (stats.absentToday + stats.notCheckedIn).toString(),
      change: `${stats.absentToday} absent, ${stats.notCheckedIn} pending`,
      changeType: 'neutral' as const,
      description: `${stats.dayOff} on scheduled day off`,
      icon: UserX,
    },
    {
      title: 'Late Check-Ins',
      value: stats.lateCheckIns.toString(),
      change: stats.lateChangeFromLastWeek > 0 
        ? `+${stats.lateChangeFromLastWeek}` 
        : stats.lateChangeFromLastWeek.toString(),
      changeType: stats.lateChangeFromLastWeek <= 0 ? 'decrease' as const : 'increase' as const,
      description: 'from last week',
      icon: Clock,
      highlight: stats.lateCheckIns > 0,
    },
    {
      title: 'Active Locations',
      value: locations.length.toString(),
      change: `${stats.totalEmployees} personnel deployed`,
      changeType: 'neutral' as const,
      description: 'client sites',
      icon: MapPin,
    },
    {
      title: 'Monthly Payroll',
      value: '$542,890',
      change: '+3.2%',
      changeType: 'increase' as const,
      description: 'from last month',
      icon: Wallet,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statsData.map((stat) => (
        <Card 
          key={stat.title} 
          className={`bg-card border-border ${
            'highlight' in stat && stat.highlight ? 'ring-1 ring-warning/50' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            {'highlight' in stat && stat.highlight ? (
              <AlertTriangle className="size-4 text-warning" />
            ) : (
              <stat.icon className="size-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${'highlight' in stat && stat.highlight ? 'text-warning' : ''}`}>
              {stat.value}
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {stat.changeType === 'increase' && (
                <TrendingUp className="size-3 text-success" />
              )}
              {stat.changeType === 'decrease' && (
                <TrendingDown className="size-3 text-success" />
              )}
              <span
                className={
                  stat.changeType === 'increase'
                    ? 'text-success'
                    : stat.changeType === 'decrease'
                    ? 'text-success'
                    : ''
                }
              >
                {stat.change}
              </span>{' '}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
