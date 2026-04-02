'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getEmployeesWithAttendance, formatTime, getLateCheckInSeverity } from '@/lib/data'
import { Clock, AlertTriangle } from 'lucide-react'

const statusStyles: Record<string, string> = {
  'present': 'bg-success/10 text-success border-success/20',
  'late': 'bg-warning/10 text-warning border-warning/20',
  'absent': 'bg-destructive/10 text-destructive border-destructive/20',
  'leave': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'not-checked-in': 'bg-muted text-muted-foreground border-muted',
  'day-off': 'bg-primary/10 text-primary/70 border-primary/20',
}

const statusLabels: Record<string, string> = {
  'present': 'Present',
  'late': 'Late',
  'absent': 'Absent',
  'leave': 'On Leave',
  'not-checked-in': 'Pending',
  'day-off': 'Day Off',
}

const severityStyles = {
  minor: 'text-warning',
  moderate: 'text-orange-500', 
  severe: 'text-destructive',
}

export function AttendanceTable() {
  const employees = getEmployeesWithAttendance()
  const allEmployees = employees
  const lateEmployees = employees.filter(e => e.status === 'late')
  const presentEmployees = employees.filter(e => e.status === 'present')
  const absentEmployees = employees.filter(e => e.status === 'absent' || e.status === 'not-checked-in')
  const dayOffEmployees = employees.filter(e => e.status === 'day-off')

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today&apos;s Attendance</CardTitle>
            <CardDescription>
              Attendance records with schedule integration
            </CardDescription>
          </div>
          {lateEmployees.length > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              <AlertTriangle className="size-3 mr-1" />
              {lateEmployees.length} late check-ins
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({allEmployees.length})</TabsTrigger>
            <TabsTrigger value="late" className="text-warning">
              Late ({lateEmployees.length})
            </TabsTrigger>
            <TabsTrigger value="present">Present ({presentEmployees.length})</TabsTrigger>
            <TabsTrigger value="absent">Absent ({absentEmployees.length})</TabsTrigger>
            <TabsTrigger value="day-off" className="text-primary/70">
              Day Off ({dayOffEmployees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <AttendanceTableContent records={allEmployees} showSchedule />
          </TabsContent>
          
          <TabsContent value="late">
            <AttendanceTableContent records={lateEmployees} showSchedule showLateDetails />
          </TabsContent>
          
          <TabsContent value="present">
            <AttendanceTableContent records={presentEmployees} showSchedule />
          </TabsContent>
          
          <TabsContent value="absent">
            <AttendanceTableContent records={absentEmployees} showSchedule />
          </TabsContent>
          
          <TabsContent value="day-off">
            <AttendanceTableContent records={dayOffEmployees} showSchedule isDayOffView />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface AttendanceTableContentProps {
  records: ReturnType<typeof getEmployeesWithAttendance>
  showSchedule?: boolean
  showLateDetails?: boolean
  isDayOffView?: boolean
}

function AttendanceTableContent({ records, showSchedule, showLateDetails, isDayOffView }: AttendanceTableContentProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No records found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            {showSchedule && (
              <TableHead className="hidden lg:table-cell">Scheduled</TableHead>
            )}
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            {showLateDetails && (
              <TableHead className="hidden sm:table-cell">Late By</TableHead>
            )}
            <TableHead className="hidden sm:table-cell">Hours</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const severity = record.status === 'late' ? getLateCheckInSeverity(record.lateMinutes) : null
            return (
              <TableRow 
                key={record.employeeId}
                className={
                  record.status === 'late' 
                    ? 'bg-warning/5' 
                    : record.status === 'day-off' 
                      ? 'bg-primary/5' 
                      : undefined
                }
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={`/avatars/${record.employeeId}.jpg`} alt={record.employeeName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {record.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{record.employeeName}</span>
                      <p className="text-xs text-muted-foreground">{record.department}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div>
                    <span className="text-sm">{record.locationName}</span>
                    <p className="text-xs text-muted-foreground font-mono">{record.locationId}</p>
                  </div>
                </TableCell>
                {showSchedule && (
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm">
                      <span className="font-mono">{formatTime(record.scheduledStart)}</span>
                      <p className="text-xs text-muted-foreground">{record.shiftName}</p>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <span className={`font-mono text-sm ${record.status === 'late' ? 'text-warning font-medium' : ''}`}>
                    {formatTime(record.actualCheckIn)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatTime(record.actualCheckOut)}
                </TableCell>
                {showLateDetails && (
                  <TableCell className="hidden sm:table-cell">
                    {record.lateMinutes > 0 && severity && (
                      <span className={`font-medium ${severityStyles[severity]}`}>
                        +{record.lateMinutes} min
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {record.workHours}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[record.status]}>
                    {statusLabels[record.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
