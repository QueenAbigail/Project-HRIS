'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  Wallet, 
  AlertTriangle,
  MapPin,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { getOverallAttendanceStats, getLocationAttendanceStats, getLateCheckIns } from '@/lib/data'
import { LocationFilter } from '@/components/reports/location-filter'
import { DateRangeFilter } from '@/components/reports/date-range-filter'

export default function ReportsPage() {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<'current-month' | 'custom'>('current-month')
  
  // Get current month dates
  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    }
  }

  const currentMonthDates = getCurrentMonthDates()
  const [startDate, setStartDate] = useState(currentMonthDates.start)
  const [endDate, setEndDate] = useState(currentMonthDates.end)
  
  const overallStats = getOverallAttendanceStats()
  const locationStats = getLocationAttendanceStats()
  const lateCheckIns = getLateCheckIns()

  // Filter late check-ins based on selected location and date range
  const filteredLateCheckIns = lateCheckIns
    .filter(record => {
      if (selectedLocationId && record.locationId !== selectedLocationId) {
        return false
      }
      // Note: In production, you'd filter by actual dates from the record
      return true
    })

  const reports = [
    {
      title: 'Attendance Report',
      description: 'Monthly attendance summary for all departments',
      icon: Clock,
      date: 'Last generated: Mar 28, 2026',
    },
    {
      title: 'Payroll Report',
      description: 'Salary and compensation breakdown',
      icon: Wallet,
      date: 'Last generated: Mar 25, 2026',
    },
    {
      title: 'Employee Report',
      description: 'Staff headcount and demographics',
      icon: Users,
      date: 'Last generated: Mar 20, 2026',
    },
    {
      title: 'Leave Report',
      description: 'Leave utilization and balance summary',
      icon: Calendar,
      date: 'Last generated: Mar 15, 2026',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download HR reports with late check-in analytics
          </p>
        </div>
        <Button>
          <FileBarChart className="mr-2 size-4" />
          Generate Custom Report
        </Button>
      </div>

      {/* Late Check-In Report Summary */}
      <Card className="bg-card border-border ring-1 ring-warning/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-warning" />
              </div>
              <div>
                <CardTitle>Late Check-In Report</CardTitle>
                <CardDescription>Today&apos;s late arrivals integrated with employee schedules</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-3" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-3" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <DateRangeFilter
            selectedRange={selectedDateRange}
            startDate={startDate}
            endDate={endDate}
            onRangeChange={setSelectedDateRange}
            onDateChange={(start, end) => {
              setStartDate(start)
              setEndDate(end)
            }}
          />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Late</span>
                <Badge 
                  variant="outline" 
                  className={
                    overallStats.lateChangeFromLastWeek < 0 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }
                >
                  {overallStats.lateChangeFromLastWeek < 0 ? (
                    <TrendingDown className="size-3 mr-1" />
                  ) : (
                    <TrendingUp className="size-3 mr-1" />
                  )}
                  {overallStats.lateChangeFromLastWeek}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-warning mt-1">{overallStats.lateCheckIns}</p>
              <p className="text-xs text-muted-foreground">employees today</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Total Late Time</span>
              <p className="text-2xl font-bold mt-1">{overallStats.totalLateMinutes}</p>
              <p className="text-xs text-muted-foreground">minutes combined</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Average Delay</span>
              <p className="text-2xl font-bold mt-1">{overallStats.averageLateMinutes}</p>
              <p className="text-xs text-muted-foreground">minutes per late arrival</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Attendance Rate</span>
              <p className="text-2xl font-bold text-success mt-1">{overallStats.attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">present today</p>
            </div>
          </div>

          {/* Late by Location */}
          <LocationFilter 
            locations={locationStats}
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
          />

          {/* Individual Late Records */}
          {filteredLateCheckIns.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                Late Employees Detail
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedLocationId && (
                    <Badge variant="outline" className="text-xs">
                      Location filtered
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {selectedDateRange === 'current-month' ? 'Current month' : 'Custom date range'}
                  </Badge>
                </div>
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Employee</th>
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Location</th>
                      <th className="text-left p-3 font-medium">Scheduled</th>
                      <th className="text-left p-3 font-medium">Actual</th>
                      <th className="text-right p-3 font-medium">Late By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLateCheckIns.map((record) => (
                      <tr key={record.id} className="bg-warning/5">
                        <td className="p-3">
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{record.shiftName}</div>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">
                          {record.locationName}
                        </td>
                        <td className="p-3 font-mono">{record.scheduledStart}</td>
                        <td className="p-3 font-mono text-warning">{record.actualCheckIn}</td>
                        <td className="p-3 text-right">
                          <Badge 
                            variant="outline" 
                            className={
                              record.lateMinutes <= 15 
                                ? 'bg-warning/10 text-warning border-warning/20' 
                                : record.lateMinutes <= 30
                                ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }
                          >
                            +{record.lateMinutes} min
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {filteredLateCheckIns.length === 0 && selectedLocationId && (
            <div className="text-center p-6 rounded-lg border border-border bg-muted/20">
              <p className="text-sm text-muted-foreground">No late check-ins for the selected location</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standard Reports */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <report.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{report.date}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 size-3" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 size-3" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
