'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DayStats {
  present: number
  late: number
  absent: number
  total: number
  attendancePercentage: number
  latePercentage: number
  absentPercentage: number
  status: 'fullAttendance' | 'partial' | 'lowAttendance'
}

interface CalendarStats {
  fullAttendance: number
  partial: number
  lowAttendance: number
  datesByStatus: {
    fullAttendance: string[]
    partial: string[]
    lowAttendance: string[]
  }
  dailyDetails: Record<string, DayStats>
}

export function AttendanceCalendar({ siteId = 'all' }: { siteId?: string }) {
  const [stats, setStats] = useState<CalendarStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (siteId && siteId !== 'all') {
          params.append('siteId', siteId)
        }

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
          // Only set initial selected date if none is selected
          setSelectedDate((prevDate) => {
            if (!prevDate && data.dailyDetails) {
              const firstDateWithData = Object.keys(data.dailyDetails).sort()[0]
              return firstDateWithData || null
            }
            return prevDate
          })
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceStats()
  }, [siteId, currentMonth])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getDayStatus = (day: number): DayStats | null => {
    if (!stats) return null
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return stats.dailyDetails[dateStr] || null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fullAttendance':
        return 'bg-success/30 hover:bg-success/40'
      case 'partial':
        return 'bg-warning/30 hover:bg-warning/40'
      case 'lowAttendance':
        return 'bg-destructive/30 hover:bg-destructive/40'
      default:
        return 'bg-muted/20 hover:bg-muted/40'
    }
  }

  const selectedDateStats = selectedDate && stats?.dailyDetails[selectedDate] ? stats.dailyDetails[selectedDate] : null

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, () => null)

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const canGoNext = !(currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear())

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Attendance Calendar</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <h3 className="text-lg font-semibold">{monthName}</h3>
              <Button variant="ghost" size="sm" onClick={nextMonth} disabled={!canGoNext}>
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const dayStats = getDayStatus(day)
                const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  .toISOString()
                  .split('T')[0]
                const isSelected = selectedDate === dateStr

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-sm font-semibold cursor-pointer transition-all ${
                      isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-transparent'
                    } ${dayStats ? getStatusColor(dayStats.status) : 'bg-muted/10'}`}
                  >
                    <span>{day}</span>
                    {dayStats && (
                      <span className="text-xs text-muted-foreground">
                        {dayStats.attendancePercentage}%
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Full Attendance</span>
                </div>
                <span className="font-medium">≥90%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-warning" />
                  <span className="text-muted-foreground">Partial</span>
                </div>
                <span className="font-medium">50-89%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Low Attendance</span>
                </div>
                <span className="font-medium">&lt;50%</span>
              </div>
            </div>

            {/* Daily Breakdown */}
            {selectedDate && (
              <div className="border-t pt-4">
                {selectedDateStats ? (
                  <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {new Date(selectedDate).toLocaleDateString('default', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-success" />
                          Attend
                        </span>
                        <span className="font-semibold">
                          {selectedDateStats.attendancePercentage}% ({selectedDateStats.present}/{selectedDateStats.total})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-warning" />
                          Late
                        </span>
                        <span className="font-semibold">
                          {selectedDateStats.latePercentage}% ({selectedDateStats.late}/{selectedDateStats.total})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-destructive" />
                          Absent
                        </span>
                        <span className="font-semibold">
                          {selectedDateStats.absentPercentage}% ({selectedDateStats.absent}/{selectedDateStats.total})
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      {new Date(selectedDate).toLocaleDateString('default', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs mt-2">No attendance records for this date</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
