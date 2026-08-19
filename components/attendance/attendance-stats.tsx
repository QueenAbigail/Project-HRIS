'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserCheck, UserX, Clock, AlertTriangle, CalendarOff, Shield } from 'lucide-react'

interface AttendanceStatsData {
  presentToday: number
  absentToday: number
  lateCheckIns: number
  averageLateMinutes: number
  onLeave: number
  dayOff: number
  totalEmployees: number
  expectedToWork: number
  attendanceRate: number
  bkoCount: number
}

interface AttendanceStatsProps {
  siteId?: string
  dateRange?: string
  refreshKey?: number
}

export function AttendanceStats({ siteId = 'all', dateRange = 'today', refreshKey = 0 }: AttendanceStatsProps) {
  const [stats, setStats] = useState<AttendanceStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsRefreshing(true)
    
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams()
        if (siteId && siteId !== 'all') {
          params.append('siteId', siteId)
        }
        
        const today = new Date()
        const end = new Date(today)
        const start = new Date(today)
        const day = today.getDay()

        if (dateRange === 'yesterday') {
          start.setDate(start.getDate() - 1)
          end.setDate(end.getDate() - 1)
        } else if (dateRange === 'week') {
          start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
        } else if (dateRange === 'month') {
          start.setDate(1)
        }

        const formatDate = (value: Date) => value.toISOString().split('T')[0]
        params.set('dateFrom', formatDate(start))
        params.set('dateTo', formatDate(end))
        
        const response = await fetch(`/api/attendance/stats?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) setStats(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch attendance stats:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    fetchStats()
    return () => { cancelled = true }
  }, [siteId, dateRange, refreshKey])

  if (loading && !stats) {
    return (
    <div className={`grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 transition-opacity ${isRefreshing ? 'opacity-70' : 'opacity-100'}`} aria-busy={isRefreshing}>
      {isRefreshing && <span className="sr-only">Updating attendance summary</span>}
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-3">
              <div className="h-8 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statConfig = [
    {
      title: 'Present',
      value: stats.presentToday,
      percentage: `${stats.attendanceRate}%`,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Absent',
      value: stats.absentToday,
      percentage: `${stats.totalEmployees > 0 ? Math.round((stats.absentToday / stats.totalEmployees) * 100) : 0}%`,
      icon: UserX,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Late Arrivals',
      value: stats.lateCheckIns,
      percentage: `${stats.totalEmployees > 0 ? Math.round((stats.lateCheckIns / stats.totalEmployees) * 100) : 0}%`,
      subtext: stats.lateCheckIns > 0 ? `Avg: ${stats.averageLateMinutes}min late` : undefined,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      highlight: stats.lateCheckIns > 0,
    },
    {
      title: 'On Leave',
      value: stats.onLeave,
      percentage: `${stats.totalEmployees > 0 ? Math.round((stats.onLeave / stats.totalEmployees) * 100) : 0}%`,
      icon: AlertTriangle,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'BKO (Coverage)',
      value: stats.bkoCount,
      percentage: `${stats.totalEmployees > 0 ? Math.round((stats.bkoCount / stats.totalEmployees) * 100) : 0}%`,
      subtext: stats.bkoCount > 0 ? `Backup replacements active` : 'No replacements',
      icon: Shield,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      highlight: stats.bkoCount > 0,
    },
    {
      title: 'Scheduled Off',
      value: stats.dayOff,
      percentage: `${stats.totalEmployees > 0 ? Math.round((stats.dayOff / stats.totalEmployees) * 100) : 0}%`,
      subtext: `${stats.expectedToWork} expected today`,
      icon: CalendarOff,
      color: 'text-primary/70',
      bgColor: 'bg-primary/10',
    },
  ]

  return (
    <div className={`grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 transition-opacity ${isRefreshing ? 'opacity-70' : 'opacity-100'}`} aria-busy={isRefreshing}>
      {isRefreshing && <span className="sr-only">Updating attendance summary</span>}
      {statConfig.map((stat) => (
        <Card 
          key={stat.title} 
          className={`bg-card border-border ${
            'highlight' in stat && stat.highlight ? 'ring-1 ring-warning/50' : ''
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className={`text-lg font-bold ${'highlight' in stat && stat.highlight ? stat.color : ''}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                {'subtext' in stat && stat.subtext && (
                  <p className="text-xs text-warning mt-0.5">{stat.subtext}</p>
                )}
              </div>
              <div className={`rounded-lg p-2 flex-shrink-0 ${stat.bgColor}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </div>
            <div className={`text-xs font-medium mt-2 ${stat.color}`}>
              {stat.percentage}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
