'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'

interface CronLog {
  id: string
  jobName: string
  status: string
  message?: string
  recordsCreated: number
  recordsSkipped: number
  error?: string
  duration?: number
  startTime: string
  endTime?: string
}

interface CronSummary {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  averageDuration: number
  totalRecordsCreated: number
  totalRecordsSkipped: number
}

export function CronStatusCard() {
  const [logs, setLogs] = useState<CronLog[]>([])
  const [summary, setSummary] = useState<CronSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCronLogs = async () => {
      try {
        const response = await fetch('/api/cron-logs?limit=5')
        if (!response.ok) throw new Error('Failed to fetch cron logs')
        
        const data = await response.json()
        setLogs(data.logs)
        setSummary(data.summary)
        setError(null)
      } catch (err) {
        console.error('[v0] Error fetching cron logs:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCronLogs()
    const interval = setInterval(fetchCronLogs, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-500/10 text-green-700 border-green-200'
      case 'ERROR':
        return 'bg-red-500/10 text-red-700 border-red-200'
      case 'RUNNING':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4" />
      case 'ERROR':
        return <AlertCircle className="w-4 h-4" />
      case 'RUNNING':
        return <Clock className="w-4 h-4 animate-spin" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Cron Job Monitor
            </CardTitle>
            <CardDescription>Attendance generation & scheduled tasks</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading cron logs...</div>
        ) : summary ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-medium text-green-700">Success Rate</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {summary.totalRuns > 0
                    ? Math.round((summary.successfulRuns / summary.totalRuns) * 100)
                    : 0}
                  %
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {summary.successfulRuns} of {summary.totalRuns} runs (7d)
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-700">Avg Duration</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {summary.averageDuration}ms
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {summary.totalRecordsCreated} records created
                </div>
              </div>
            </div>

            {/* Recent Runs */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Recent Runs</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 flex-shrink-0">
                          {getStatusIcon(log.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {log.jobName.replace('_', ' ')}
                            </Badge>
                            <Badge
                              className={`text-xs border ${getStatusColor(log.status)}`}
                              variant="outline"
                            >
                              {log.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.message || log.error}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span>📝 {log.recordsCreated} created</span>
                            <span>⏭️ {log.recordsSkipped} skipped</span>
                            {log.duration && <span>⏱️ {log.duration}ms</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(log.startTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No cron runs yet
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
