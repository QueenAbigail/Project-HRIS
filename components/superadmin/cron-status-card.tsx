'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Zap } from 'lucide-react'

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
  const [recentRunsOpen, setRecentRunsOpen] = useState(false)

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
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-sm text-yellow-700 dark:text-yellow-200 space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Monitoring Active
            </p>
            <p>Cron logs are being tracked. The next scheduled run will appear here.</p>
            <ul className="list-disc list-inside mt-2 text-xs space-y-1 opacity-90">
              <li>Daily run: <span className="font-mono">0 17 * * *</span> (00:00 GMT+7)</li>
              <li>Automatic attendance generation based on shift patterns</li>
              <li>Records with status: NOT_CHECKED_IN (pending user check-in)</li>
              <li>First run will show once cron executes or manual generation triggers</li>
            </ul>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading cron logs...</div>
        ) : (summary || logs.length > 0) ? (
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
            <Collapsible open={recentRunsOpen} onOpenChange={setRecentRunsOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md py-2 text-left text-sm font-semibold transition-colors hover:bg-muted/50"
                  aria-label={`${recentRunsOpen ? 'Collapse' : 'Expand'} recent cron runs`}
                >
                  <span>Recent Runs</span>
                  <ChevronDown className={`size-4 transition-transform ${recentRunsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
              <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
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
                    No cron runs yet. First run scheduled for next cron execution.
                  </div>
                )}
              </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-200 space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Cron Job Monitoring
            </p>
            <p>The attendance generation cron job is configured and monitoring is active.</p>
            <ul className="list-disc list-inside mt-2 text-xs space-y-1 opacity-90">
              <li>Scheduled: Daily at 00:00 GMT+7 (17:00 UTC)</li>
              <li>Function: Auto-generate attendance records based on employee shift patterns</li>
              <li>Status: Waiting for next scheduled execution</li>
              <li>Records will appear here after first run</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
