'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react'

interface StatCard {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

export function PatrolStats() {
  // Mock data - in real implementation, fetch from database
  const stats: StatCard[] = [
    {
      title: 'Total Patrols Today',
      value: 24,
      icon: <MapPin className="h-4 w-4" />,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Completed',
      value: 18,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'In Progress',
      value: 4,
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-yellow-50 text-yellow-700',
    },
    {
      title: 'Missed',
      value: 2,
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'bg-red-50 text-red-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
