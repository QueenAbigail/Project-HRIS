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
import { getOverallAttendanceStats, getLocationAttendanceStats, getLateCheckIns, getPayrollStats, formatCurrency } from '@/lib/data'
import { LocationFilter } from '@/components/reports/location-filter'
import { EmployeeLocationFilter } from '@/components/reports/employee-location-filter'
import { AttendanceLocationFilter } from '@/components/reports/attendance-location-filter'
import { PayrollLocationFilter } from '@/components/reports/payroll-location-filter'
import { DateRangeFilter } from '@/components/reports/date-range-filter'

export default function ReportsPage() {
  // Late Check-In Report filters
  const [lateCheckInLocationId, setLateCheckInLocationId] = useState<string | null>(null)
  const [lateCheckInDateRange, setLateCheckInDateRange] = useState<'current-month' | 'custom'>('current-month')
  
  // Attendance Report filters
  const [attendanceLocationId, setAttendanceLocationId] = useState<string | null>(null)
  const [attendanceDateRange, setAttendanceDateRange] = useState<'current-month' | 'custom'>('current-month')
  
  // Employee Report filters
  const [employeeLocationId, setEmployeeLocationId] = useState<string | null>(null)
  
  // Payroll Report filters
  const [payrollLocationId, setPayrollLocationId] = useState<string | null>(null)
  const [payrollDateRange, setPayrollDateRange] = useState<'current-month' | 'custom'>('current-month')
  
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
  
  // Late Check-In Report state
  const [lateCheckInStartDate, setLateCheckInStartDate] = useState(currentMonthDates.start)
  const [lateCheckInEndDate, setLateCheckInEndDate] = useState(currentMonthDates.end)
  
  // Attendance Report state
  const [attendanceStartDate, setAttendanceStartDate] = useState(currentMonthDates.start)
  const [attendanceEndDate, setAttendanceEndDate] = useState(currentMonthDates.end)
  
  // Payroll Report state
  const [payrollStartDate, setPayrollStartDate] = useState(currentMonthDates.start)
  const [payrollEndDate, setPayrollEndDate] = useState(currentMonthDates.end)
  
  const overallStats = getOverallAttendanceStats()
  const locationStats = getLocationAttendanceStats()
  const lateCheckIns = getLateCheckIns()
  const payrollStats = getPayrollStats()

  // Export handlers for Late Check-In Report
  const exportLatCheckInsPDF = () => {
    const filteredData = lateCheckInLocationId
      ? lateCheckIns.filter(record => record.locationId === lateCheckInLocationId)
      : lateCheckIns
    
    console.log('[v0] Exporting Late Check-In PDF', {
      dateRange: lateCheckInDateRange,
      startDate: lateCheckInStartDate,
      endDate: lateCheckInEndDate,
      selectedLocation: lateCheckInLocationId,
      recordCount: filteredData.length,
    })
  }

  const exportLatCheckInsExcel = () => {
    const filteredData = lateCheckInLocationId
      ? lateCheckIns.filter(record => record.locationId === lateCheckInLocationId)
      : lateCheckIns
    
    console.log('[v0] Exporting Late Check-In Excel', {
      dateRange: lateCheckInDateRange,
      startDate: lateCheckInStartDate,
      endDate: lateCheckInEndDate,
      selectedLocation: lateCheckInLocationId,
      recordCount: filteredData.length,
    })
  }

  // Export handlers for Attendance Report
  const exportAttendancePDF = () => {
    const filteredLocations = attendanceLocationId
      ? locationStats.filter(loc => loc.locationId === attendanceLocationId)
      : locationStats
    
    console.log('[v0] Exporting Attendance PDF', {
      dateRange: attendanceDateRange,
      startDate: attendanceStartDate,
      endDate: attendanceEndDate,
      selectedLocation: attendanceLocationId,
      locationCount: filteredLocations.length,
    })
  }

  const exportAttendanceExcel = () => {
    const filteredLocations = attendanceLocationId
      ? locationStats.filter(loc => loc.locationId === attendanceLocationId)
      : locationStats
    
    console.log('[v0] Exporting Attendance Excel', {
      dateRange: attendanceDateRange,
      startDate: attendanceStartDate,
      endDate: attendanceEndDate,
      selectedLocation: attendanceLocationId,
      locationCount: filteredLocations.length,
    })
  }

  // Export handlers for Employee Report
  const exportEmployeePDF = () => {
    console.log('[v0] Exporting Employee PDF', {
      selectedLocation: employeeLocationId,
    })
  }

  const exportEmployeeExcel = () => {
    console.log('[v0] Exporting Employee Excel', {
      selectedLocation: employeeLocationId,
    })
  }

  // Export handlers for Payroll Report
  const exportPayrollPDF = () => {
    console.log('[v0] Exporting Payroll PDF', {
      dateRange: payrollDateRange,
      startDate: payrollStartDate,
      endDate: payrollEndDate,
      selectedLocation: payrollLocationId,
    })
  }

  const exportPayrollExcel = () => {
    console.log('[v0] Exporting Payroll Excel', {
      dateRange: payrollDateRange,
      startDate: payrollStartDate,
      endDate: payrollEndDate,
      selectedLocation: payrollLocationId,
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
              <Button variant="outline" size="sm" onClick={exportLatCheckInsPDF}>
                <Download className="mr-2 size-3" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportLatCheckInsExcel}>
                <Download className="mr-2 size-3" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <DateRangeFilter
            selectedRange={lateCheckInDateRange}
            startDate={lateCheckInStartDate}
            endDate={lateCheckInEndDate}
            onRangeChange={setLateCheckInDateRange}
            onDateChange={(start, end) => {
              setLateCheckInStartDate(start)
              setLateCheckInEndDate(end)
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
            selectedLocationId={lateCheckInLocationId}
            onLocationSelect={setLateCheckInLocationId}
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
              <Button variant="outline" size="sm" onClick={exportAttendancePDF}>
                <Download className="mr-2 size-3" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportAttendanceExcel}>
                <Download className="mr-2 size-3" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <DateRangeFilter
            selectedRange={attendanceDateRange}
            startDate={attendanceStartDate}
            endDate={attendanceEndDate}
            onRangeChange={setAttendanceDateRange}
            onDateChange={(start, end) => {
              setAttendanceStartDate(start)
              setAttendanceEndDate(end)
            }}
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

          {/* Location Filter */}
          <AttendanceLocationFilter 
            locations={locationStats}
            selectedLocationId={attendanceLocationId}
            onLocationSelect={setAttendanceLocationId}
          />
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

          {/* Location Filter */}
          <EmployeeLocationFilter 
            locations={locationStats}
            selectedLocationId={employeeLocationId}
            onLocationSelect={setEmployeeLocationId}
          />
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
            selectedRange={payrollDateRange}
            startDate={payrollStartDate}
            endDate={payrollEndDate}
            onRangeChange={setPayrollDateRange}
            onDateChange={(start, end) => {
              setPayrollStartDate(start)
              setPayrollEndDate(end)
            }}
          />

          {/* Payroll Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Total Payroll</span>
              <p className="text-2xl font-bold mt-1">{formatCurrency(payrollStats.totalPayroll)}</p>
              <p className="text-xs text-muted-foreground">this period</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Avg Salary</span>
              <p className="text-2xl font-bold mt-1">${payrollStats.averageSalary.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">per employee</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Overtime Cost</span>
              <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(payrollStats.overtimeCost)}</p>
              <p className="text-xs text-muted-foreground">OT compensation</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-sm text-muted-foreground">Deductions</span>
              <p className="text-2xl font-bold mt-1">{formatCurrency(payrollStats.totalDeductions)}</p>
              <p className="text-xs text-muted-foreground">total deductions</p>
            </div>
          </div>

          {/* Location Filter */}
          <PayrollLocationFilter 
            locations={locationStats}
            selectedLocationId={payrollLocationId}
            onLocationSelect={setPayrollLocationId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
