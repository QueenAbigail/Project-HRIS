'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Wallet, UserCheck, UserX, MapPin, TrendingUp, TrendingDown } from 'lucide-react'

const stats = [
  {
    title: 'Total Employees',
    value: '247',
    change: '+12',
    changeType: 'increase' as const,
    description: 'from last month',
    icon: Users,
  },
  {
    title: 'Present Today',
    value: '216',
    change: '87.4%',
    changeType: 'increase' as const,
    description: 'attendance rate',
    icon: UserCheck,
  },
  {
    title: 'Absent / Not Checked In',
    value: '28',
    change: '15 absent, 13 pending',
    changeType: 'neutral' as const,
    description: 'across all locations',
    icon: UserX,
  },
  {
    title: 'Late Check-Ins',
    value: '10',
    change: '-3',
    changeType: 'decrease' as const,
    description: 'from last week',
    icon: Clock,
  },
  {
    title: 'Active Locations',
    value: '6',
    change: '247 personnel deployed',
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

export function StatsCards() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {stat.changeType === 'increase' && (
                <TrendingUp className="size-3 text-success" />
              )}
              {stat.changeType === 'decrease' && (
                <TrendingDown className="size-3 text-destructive" />
              )}
              <span
                className={
                  stat.changeType === 'increase'
                    ? 'text-success'
                    : stat.changeType === 'decrease'
                    ? 'text-destructive'
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
