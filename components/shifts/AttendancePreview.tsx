'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, CheckCircle, Users, Calendar } from 'lucide-react'

interface AttendancePreviewData {
  employeeName: string
  patternName: string
  patternType: string
  startDate: Date
  previewDays: number
  scheduledDays: Array<{
    date: string
    dayOfWeek: string
    isScheduled: boolean
    shiftType?: string
    reason?: string
  }>
  summary: {
    totalDays: number
    scheduledDays: number
    offDays: number
  }
}

interface AttendancePreviewProps {
  employeeId: string
  patternId: string
  startDate: Date
  patterns?: any[]
  employees?: any[]
}

export function AttendancePreview({
  employeeId,
  patternId,
  startDate,
  patterns = [],
  employees = []
}: AttendancePreviewProps) {
  const [preview, setPreview] = useState<AttendancePreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!employeeId || !patternId || !startDate) return

    const generatePreview = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/attendance/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            patternId,
            startDate: startDate.toISOString(),
            previewDays: 30
          })
        })

        if (!response.ok) {
          throw new Error('Failed to generate preview')
        }

        const data = await response.json()
        setPreview(data)
      } catch (err) {
        console.error('[v0] Error generating attendance preview:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    generatePreview()
  }, [employeeId, patternId, startDate])

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mb-2"></div>
            <p className="text-sm text-muted-foreground">Generating attendance preview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!preview) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      <CardHeader className="border-b border-blue-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle>Attendance Schedule Preview</CardTitle>
            <CardDescription>
              {preview.employeeName} - {preview.patternName} ({preview.patternType})
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-blue-100 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{preview.summary.scheduledDays}</div>
            <div className="text-xs text-muted-foreground mt-1">Days Scheduled</div>
          </div>
          <div className="bg-white rounded-lg border border-amber-100 p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{preview.summary.offDays}</div>
            <div className="text-xs text-muted-foreground mt-1">Off Days</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-gray-600">{preview.summary.totalDays}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Days</div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            30-Day Schedule
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
            
            {/* Calendar cells */}
            {preview.scheduledDays.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded border flex flex-col items-center justify-center text-xs font-medium transition-all ${
                  day.isScheduled
                    ? 'bg-green-100 border-green-300 text-green-900'
                    : 'bg-gray-100 border-gray-200 text-gray-500'
                }`}
                title={`${day.dayOfWeek}, ${day.date}`}
              >
                <span>{new Date(day.date).getDate()}</span>
                {day.shiftType && <span className="text-[10px] opacity-70">{day.shiftType[0].toUpperCase()}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Scheduled Days Detail
          </h4>
          <ScrollArea className="h-64 rounded border p-3 bg-white">
            <div className="space-y-1">
              {preview.scheduledDays
                .filter(d => d.isScheduled)
                .map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1.5 px-2 hover:bg-blue-50 rounded">
                    <div>
                      <span className="font-medium">{day.dayOfWeek}</span>
                      <span className="text-muted-foreground ml-2">{day.date}</span>
                    </div>
                    {day.shiftType && (
                      <Badge variant="outline" className="text-xs">
                        {day.shiftType}
                      </Badge>
                    )}
                  </div>
                ))}
              {preview.scheduledDays.filter(d => d.isScheduled).length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No scheduled days in preview period
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            This preview shows the first 30 days from the start date. Actual attendance records will be generated daily at 00:00 GMT+7.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
