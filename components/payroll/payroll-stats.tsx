'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp, Clock, Users } from 'lucide-react'

const stats = [
  {
    title: 'Total Payroll',
    value: '$542,890',
    change: '+3.2%',
    icon: Wallet,
    description: 'This month',
  },
  {
    title: 'Overtime Cost',
    value: '$78,500',
    change: '+12.5%',
    icon: Clock,
    description: '1,245 hours',
  },
  {
    title: 'Avg. Salary',
    value: '$2,198',
    change: '+1.8%',
    icon: TrendingUp,
    description: 'Per employee',
  },
  {
    title: 'Employees Paid',
    value: '247',
    change: '100%',
    icon: Users,
    description: 'All processed',
  },
]

export function PayrollStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <stat.icon className="size-5 text-primary" />
              <span className="text-xs text-success font-medium">{stat.change}</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
