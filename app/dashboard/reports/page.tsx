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

  // Export handlers
  const exportLatCheckInsPDF = () => {
    const filteredData = selectedLocationId
      ? lateCheckIns.filter(record => record.locationId === selectedLocationId)
      : lateCheckIns
    
    console.log('[v0] Exporting Late Check-In PDF', {
      dateRange: selectedDateRange,
      startDate,
      endDate,
      selectedLocation: selectedLocationId,
      recordCount: filteredData.length,
      data: filteredData
    })
  }

  const exportLatCheckInsExcel = () => {
    const filteredData = selectedLocationId
      ? lateCheckIns.filter(record => record.locationId === selectedLocationId)
      : lateCheckIns
    
    console.log('[v0] Exporting Late Check-In Excel', {
      dateRange: selectedDateRange,
      startDate,
      endDate,
      selectedLocation: selectedLocationId,
      recordCount: filteredData.length,
      data: filteredData
    })
  }

  const exportAttendancePDF = () => {
    const filteredLocations = selectedLocationId
      ? locationStats.filter(loc => loc.locationId === selectedLocationId)
      : locationStats
    
    console.log('[v0] Exporting Attendance PDF', {
      dateRange: selectedDateRange,
      startDate,
      endDate,
      selectedLocation: selectedLocationId,
      locationCount: filteredLocations.length,
      data: filteredLocations
    })
  }

  const exportEmployeePDF = () => {
    console.log('[v0] Exporting Employee PDF', {
      dateRange: selectedDateRange,
      startDate,
      endDate,
      selectedLocation: selectedLocationId,
    })
  }

  const exportEmployeeExcel = () => {
    console.log('[v0] Exporting Employee Excel', {
      dateRange: selectedDateRange,
      startDate,
      endDate,
      selectedLocation: selectedLocationId,
    })
  }

  const exportPayrollPDF = () => {
    console.log('[v0] Exporting Payroll PDF', {
      dateRange: selectedDateRange,
      startDate,
      endDate,
      selectedLocation: selectedLocationId,
    })
  }

  const exportPayrollExcel = () => {
    console.log('[v0] Exporting Payroll Excel', {
      dateRange: selectedDateRange,
      startDate,
      endDate,
      selectedLocation: selectedLocationId,
    })
  }

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
        </CardContent>
      </Card>

      {/* Attendance Report */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>Attendance Report</CardTitle>
                <CardDescription>Complete attendance records for all employees</CardDescription>
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

          {/* Location Filter */}
          <LocationFilter 
            locations={locationStats}
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
          />

          {/* Attendance Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Total Staff</span>
              <p className="text-2xl font-bold mt-1">{overallStats.totalEmployees}</p>
              <p className="text-xs text-muted-foreground">employees</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Expected Today</span>
              <p className="text-2xl font-bold mt-1">{overallStats.expectedToWork}</p>
              <p className="text-xs text-muted-foreground">excluding day-off</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Attended</span>
              <p className="text-2xl font-bold text-success mt-1">{overallStats.presentToday}</p>
              <p className="text-xs text-muted-foreground">{overallStats.attendanceRate}% attendance</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Absent</span>
              <p className="text-2xl font-bold text-destructive mt-1">{overallStats.absentToday + overallStats.notCheckedIn}</p>
              <p className="text-xs text-muted-foreground">absent or no check-in</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Report */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="size-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Employee Report</CardTitle>
                <CardDescription>Staff headcount and demographics</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportEmployeePDF}>
                <Download className="mr-2 size-3" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportEmployeeExcel}>
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

          {/* Location Filter */}
          <LocationFilter 
            locations={locationStats}
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
          />

          {/* Employee Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Total Employees</span>
              <p className="text-2xl font-bold mt-1">{overallStats.totalEmployees}</p>
              <p className="text-xs text-muted-foreground">on payroll</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Active Today</span>
              <p className="text-2xl font-bold text-success mt-1">{overallStats.presentToday}</p>
              <p className="text-xs text-muted-foreground">working today</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">On Leave</span>
              <p className="text-2xl font-bold text-blue-500 mt-1">{overallStats.onLeave || 0}</p>
              <p className="text-xs text-muted-foreground">approved leave</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Absent</span>
              <p className="text-2xl font-bold text-destructive mt-1">{overallStats.absentToday}</p>
              <p className="text-xs text-muted-foreground">not working today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Report */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Wallet className="size-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>Payroll Report</CardTitle>
                <CardDescription>Salary and compensation breakdown</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportPayrollPDF}>
                <Download className="mr-2 size-3" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportPayrollExcel}>
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

          {/* Location Filter */}
          <LocationFilter 
            locations={locationStats}
            selectedLocationId={selectedLocationId}
            onLocationSelect={setSelectedLocationId}
          />

          {/* Payroll Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Total Payroll</span>
              <p className="text-2xl font-bold mt-1">$234.5K</p>
              <p className="text-xs text-muted-foreground">this period</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Avg Salary</span>
              <p className="text-2xl font-bold mt-1">$3,850</p>
              <p className="text-xs text-muted-foreground">per employee</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Overtime Cost</span>
              <p className="text-2xl font-bold text-warning mt-1">$12.4K</p>
              <p className="text-xs text-muted-foreground">OT compensation</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Deductions</span>
              <p className="text-2xl font-bold mt-1">$28.3K</p>
              <p className="text-xs text-muted-foreground">total deductions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
