'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, Clock, MapPin } from 'lucide-react'

interface Counts {
  total: number
  active: number
  onLeave: number
  inactive: number
}

interface LocationStat {
  name: string
  code: string
  count: number
}

interface StatusStat {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface EmployeesStatsProps {
  counts: Counts
  locationStats: LocationStat[]
}

export function EmployeesStats({ 
  counts, 
  locationStats 
}: EmployeesStatsProps) {
  const statusStats: StatusStat[] = [
    {
      title: 'Total Active User',
      value: counts.active,
      icon: UserCheck,
      color: 'text-success',
    },
    {
      title: 'On Leave',
      value: counts.onLeave,
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'Inactive User',
      value: counts.inactive,
      icon: UserX,
      color: 'text-muted-foreground',
    },
    {
      title: 'Total User',
      value: counts.total,
      icon: Users,
      color: 'text-primary',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {statusStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`${stat.color}`}>
                  <Icon className="size-8" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Location Distribution */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="size-4" />
            Personnel by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {locationStats.map((location) => (
              <div
                key={location.code}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div>
                  <p className="font-medium text-sm truncate max-w-[120px]">{location.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{location.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{location.count}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
