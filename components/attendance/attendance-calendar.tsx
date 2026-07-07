'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Loader2 } from 'lucide-react'

interface AttendanceStatus {
  fullAttendance: number
  partial: number
  lowAttendance: number
  datesByStatus: {
    fullAttendance: string[]
    partial: string[]
    lowAttendance: string[]
  }
}

export function AttendanceCalendar({ siteId = 'all' }: { siteId?: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [stats, setStats] = useState<AttendanceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (siteId && siteId !== 'all') {
          params.append('siteId', siteId)
        }
        // Add month range for the calendar
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)
        params.append('startDate', startDate.toISOString().split('T')[0])
        params.append('endDate', endDate.toISOString().split('T')[0])

        const response = await fetch(`/api/attendance/calendar-stats?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch calendar stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceStats()
  }, [siteId, currentMonth])

  const getDateStatus = (dateStr: string): 'fullAttendance' | 'partial' | 'lowAttendance' | null => {
    if (!stats) return null
    const dateKey = dateStr.replace(/-/g, '')
    
    if (stats.datesByStatus.fullAttendance?.includes(dateKey)) return 'fullAttendance'
    if (stats.datesByStatus.partial?.includes(dateKey)) return 'partial'
    if (stats.datesByStatus.lowAttendance?.includes(dateKey)) return 'lowAttendance'
    return null
  }

  const renderDaysGrid = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const days = []

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const status = getDateStatus(dateStr)
      const statusColor = status === 'fullAttendance' 
        ? 'bg-success/20 border-success/50'
        : status === 'partial'
        ? 'bg-warning/20 border-warning/50'
        : status === 'lowAttendance'
        ? 'bg-destructive/20 border-destructive/50'
        : 'bg-muted/20 border-muted/50'

      days.push(
        <div
          key={i}
          className={`h-10 flex items-center justify-center rounded border text-xs font-medium ${statusColor} ${status ? 'ring-1' : ''}`}
          title={`${dateStr}: ${status || 'No data'}`}
        >
          {i}
          {status && (
            <div className={`absolute -top-1 -right-1 size-2 rounded-full ${
              status === 'fullAttendance' ? 'bg-success' : status === 'partial' ? 'bg-warning' : 'bg-destructive'
            }`} />
          )}
        </div>
      )
    }

    return days
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md"
            disabled={(day) => day > new Date()}
          />
        )}
      </CardContent>
      <CardContent className="pt-0 border-t border-border">
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Full Attendance</span>
            </div>
            <span className="font-medium">{stats?.fullAttendance ?? 0} days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Partial</span>
            </div>
            <span className="font-medium">{stats?.partial ?? 0} days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Low Attendance</span>
            </div>
            <span className="font-medium">{stats?.lowAttendance ?? 0} days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
