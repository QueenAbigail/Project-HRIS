'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, Clock, MapPin } from 'lucide-react'

const statusStats = [
  {
    title: 'Total',
    value: 200,
    icon: Users,
    color: 'text-primary',
  },
  {
    title: 'Active',
    value: 168,
    icon: UserCheck,
    color: 'text-success',
  },
  {
    title: 'On Leave',
    value: 18,
    icon: Clock,
    color: 'text-warning',
  },
  {
    title: 'Inactive',
    value: 14,
    icon: UserX,
    color: 'text-muted-foreground',
  },
]

const locationStats = [
  { name: 'Head Office', code: 'HO', count: 35 },
  { name: 'Plaza Tower - Downtown', code: 'PT-DT', count: 48 },
  { name: 'Riverside Mall', code: 'RM', count: 52 },
  { name: 'Metro Bank - Central', code: 'MB-CT', count: 28 },
  { name: 'Corporate Center - North', code: 'CC-N', count: 44 },
  { name: 'Industrial Park - West', code: 'IP-W', count: 40 },
]

export function EmployeesStats() {
  return (
    <div className="space-y-4">
      {/* Status Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusStats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`${stat.color}`}>
                <stat.icon className="size-8" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
