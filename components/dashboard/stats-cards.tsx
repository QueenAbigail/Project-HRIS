'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Calendar, UserCheck, UserX, MapPin, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface StatsCardsProps {
  stats: any
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 h-[200px]">
        <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground">
          <Users className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Belum ada data untuk saat ini</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees?.toString() ?? '0',
      icon: Users,
    },
    {
      title: 'Present Today',
      value: stats.presentToday?.toString() ?? '0',
      icon: UserCheck,
    },
    {
      title: 'Absent / Not Checked In',
      value: ((stats.absentToday ?? 0) + (stats.notCheckedIn ?? 0)).toString(),
      change: `${stats.absentToday ?? 0} absent, ${stats.notCheckedIn ?? 0} pending`,
      changeType: 'neutral' as const,
      icon: UserX,
    },
    {
      title: 'Late Check-Ins',
      value: (stats.lateCheckIns ?? 0).toString(),
      icon: Clock,
      highlight: (stats.lateCheckIns ?? 0) > 0,
    },
    {
      title: 'Active Locations',
      value: (stats.activeLocations ?? 0).toString(),
      icon: MapPin,
    },
    {
      title: 'Monthly Leaves',
      value: stats.approvedLeavesThisMonth?.toString() ?? '0',
      change: undefined,
      changeType: 'neutral' as const,
      description: 'approved this month',
      icon: Calendar,
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
