'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react'

interface Stats {
  pending: number
  approvedThisMonth: number
  rejectedThisMonth: number
  onLeaveToday: number
}

export function LeaveStats() {
  const [stats, setStats] = useState<Stats>({ pending: 0, approvedThisMonth: 0, rejectedThisMonth: 0, onLeaveToday: 0 })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leaves/stats')
      if (!response.ok) throw new Error('Leave statistics request failed')
      const data = await response.json()
      setStats(data)
    } catch {
      toast.error('Leave statistics could not be loaded', {
        description: 'Please check your connection or contact an administrator if the problem continues.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleLeaveUpdated = () => {
      fetchStats()
    }

    const initialFetch = window.setTimeout(() => void fetchStats(), 0)
    // Listen for leave status changes
    
    window.addEventListener('leaveStatusUpdated', handleLeaveUpdated)
    window.addEventListener('leaveRequestCreated', handleLeaveUpdated)
    return () => {
      window.clearTimeout(initialFetch)
      window.removeEventListener('leaveStatusUpdated', handleLeaveUpdated)
      window.removeEventListener('leaveRequestCreated', handleLeaveUpdated)
    }
  }, [])

  const statConfigs = [
    {
      title: 'Pending Requests',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Approved This Month',
      value: stats.approvedThisMonth,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Rejected This Month',
      value: stats.rejectedThisMonth,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'On Leave Today',
      value: stats.onLeaveToday,
      icon: Calendar,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfigs.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
              {loading ? (
                <Loader2 className={`size-5 ${stat.color} animate-spin`} />
              ) : (
                <stat.icon className={`size-5 ${stat.color}`} />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? '-' : stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
