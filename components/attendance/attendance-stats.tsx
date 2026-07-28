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
}

export function AttendanceStats({ siteId = 'all', dateRange = 'today' }: AttendanceStatsProps) {
  const [stats, setStats] = useState<AttendanceStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setStats(null)
    
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams()
        if (siteId && siteId !== 'all') {
          params.append('siteId', siteId)
        }
        
        // Get date based on dateRange
        const today = new Date()
        let date = today.toISOString().split('T')[0]
        
        if (dateRange === 'today') {
          date = today.toISOString().split('T')[0]
        } else if (dateRange === 'this-week') {
          // For week view, we might need to adjust, but let's keep it simple for now
          date = today.toISOString().split('T')[0]
        } else if (dateRange === 'this-month') {
          // Same as today for now - stats API might need enhancement for ranges
          date = today.toISOString().split('T')[0]
        }
        
        params.append('date', date)
        
        const response = await fetch(`/api/attendance/stats?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch attendance stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [siteId, dateRange])

  if (loading || !stats) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
