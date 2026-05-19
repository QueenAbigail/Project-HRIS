'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getEmployeesWithAttendance, formatTime, getLateCheckInSeverity, EmployeeWithAttendance, getBKOAssignments } from '@/lib/data'
import { Clock, AlertTriangle, MapPin, Camera, Navigation, ExternalLink, Shield } from 'lucide-react'
import type { GpsCoordinates } from '@/lib/constants'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

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

const bkoStyles = 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'

export function AttendanceTable({ siteId = 'all' }: { siteId?: string }) {
  const employees = getEmployeesWithAttendance()
  const bkoAssignments = getBKOAssignments()
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithAttendance | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const allEmployees = employees
  const lateEmployees = employees.filter(e => e.status === 'late')
  const presentEmployees = employees.filter(e => e.status === 'present')
  const absentEmployees = employees.filter(e => e.status === 'absent' || e.status === 'not-checked-in')
  const dayOffEmployees = employees.filter(e => e.status === 'day-off')
  
  // Get BKO info for selected employee if any
  const selectedBKOInfo = selectedEmployee ? bkoAssignments.find(b => b.employeeId === selectedEmployee.employeeId) : null
  const isSelectedEmployeeBKO = !!selectedBKOInfo

  const openDetails = (employee: EmployeeWithAttendance) => {
    setSelectedEmployee(employee)
    setDetailsOpen(true)
  }

  const openGoogleMaps = (gps: GpsCoordinates) => {
    const url = `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* GPS and Photo Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              Attendance Details - {selectedEmployee?.employeeName}
            </DialogTitle>
            <DialogDescription>
              GPS location and selfie verification for check-in/check-out
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedEmployee.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{selectedEmployee.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.department} - {selectedEmployee.position}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.locationName}</p>
                </div>
                <div className="flex flex-col gap-2 ml-auto">
                  <Badge variant="outline" className={statusStyles[selectedEmployee.status]}>
                    {statusLabels[selectedEmployee.status]}
                  </Badge>
                  {isSelectedEmployeeBKO && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Badge variant="outline" className={`${bkoStyles} cursor-pointer`}>
                          <Shield className="size-3 mr-1" />
                          BKO
                        </Badge>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64" align="end">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Backup Replacement</h4>
                            <div className="space-y-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Currently working as</p>
                                <p className="font-medium">{selectedBKOInfo.backupEmployeeName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Covering for</p>
                                <p className="font-medium text-amber-600 dark:text-amber-400">{selectedBKOInfo.originalEmployeeName}</p>
                              </div>
                              <div className="pt-2 border-t border-muted">
                                <p className="text-muted-foreground">Status: On Leave</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </div>
              </div>
              
              {/* BKO Details Section */}
              {isSelectedEmployeeBKO && selectedBKOInfo && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="size-4 text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-sm">Backup Replacement (BKO)</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Covering for <span className="font-semibold">{selectedBKOInfo.originalEmployeeName}</span> who is on leave
                  </p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Check In Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-success">
                    <Clock className="size-4" />
                    Check In - {formatTime(selectedEmployee.actualCheckIn)}
                  </h3>
                  
                  {/* Check In Photo */}
                  {selectedEmployee.checkInPhotoUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Camera className="size-4" />
                        Selfie Verification
                      </div>
                      <div className="relative aspect-square w-full max-w-[200px] bg-muted rounded-lg overflow-hidden border border-border">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Avatar className="size-20">
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                              {selectedEmployee.initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            Verified at {formatTime(selectedEmployee.actualCheckIn)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      No check-in photo available
                    </div>
                  )}
                  
                  {/* Check In GPS */}
                  {selectedEmployee.checkInGps ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Navigation className="size-4" />
                        GPS Location
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="text-sm font-medium">{selectedEmployee.checkInGps.address || 'Unknown location'}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Lat: {selectedEmployee.checkInGps.latitude.toFixed(6)}</span>
                          <span>Lng: {selectedEmployee.checkInGps.longitude.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Accuracy: {selectedEmployee.checkInGps.accuracy}m
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openGoogleMaps(selectedEmployee.checkInGps!)}
                            className="gap-1"
                          >
                            <ExternalLink className="size-3" />
                            View on Map
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      No GPS data available
                    </div>
                  )}
                </div>

                {/* Check Out Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-primary">
                    <Clock className="size-4" />
                    Check Out - {formatTime(selectedEmployee.actualCheckOut)}
                  </h3>
                  
                  {/* Check Out Photo */}
                  {selectedEmployee.checkOutPhotoUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Camera className="size-4" />
                        Selfie Verification
                      </div>
                      <div className="relative aspect-square w-full max-w-[200px] bg-muted rounded-lg overflow-hidden border border-border">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Avatar className="size-20">
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                              {selectedEmployee.initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            Verified at {formatTime(selectedEmployee.actualCheckOut)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      {selectedEmployee.actualCheckOut ? 'No check-out photo available' : 'Not checked out yet'}
                    </div>
                  )}
                  
                  {/* Check Out GPS */}
                  {selectedEmployee.checkOutGps ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Navigation className="size-4" />
                        GPS Location
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="text-sm font-medium">{selectedEmployee.checkOutGps.address || 'Unknown location'}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Lat: {selectedEmployee.checkOutGps.latitude.toFixed(6)}</span>
                          <span>Lng: {selectedEmployee.checkOutGps.longitude.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Accuracy: {selectedEmployee.checkOutGps.accuracy}m
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openGoogleMaps(selectedEmployee.checkOutGps!)}
                            className="gap-1"
                          >
                            <ExternalLink className="size-3" />
                            View on Map
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      {selectedEmployee.actualCheckOut ? 'No GPS data available' : 'Not checked out yet'}
                    </div>
                  )}
                </div>
              </div>

              {/* Late Warning */}
              {selectedEmployee.status === 'late' && selectedEmployee.lateMinutes > 0 && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="size-4" />
                    <span className="font-medium">Late by {selectedEmployee.lateMinutes} minutes</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scheduled start: {formatTime(selectedEmployee.scheduledStart)} | Actual: {formatTime(selectedEmployee.actualCheckIn)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <AttendanceTableContent records={allEmployees} bkoAssignments={bkoAssignments} showSchedule onViewDetails={openDetails} />
          </TabsContent>
          
          <TabsContent value="late">
            <AttendanceTableContent records={lateEmployees} bkoAssignments={bkoAssignments} showSchedule showLateDetails onViewDetails={openDetails} />
          </TabsContent>
          
          <TabsContent value="present">
            <AttendanceTableContent records={presentEmployees} bkoAssignments={bkoAssignments} showSchedule onViewDetails={openDetails} />
          </TabsContent>
          
          <TabsContent value="absent">
            <AttendanceTableContent records={absentEmployees} bkoAssignments={bkoAssignments} showSchedule onViewDetails={openDetails} />
          </TabsContent>
          
          <TabsContent value="day-off">
            <AttendanceTableContent records={dayOffEmployees} bkoAssignments={bkoAssignments} showSchedule isDayOffView onViewDetails={openDetails} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </>
  )
}

interface AttendanceTableContentProps {
  records: ReturnType<typeof getEmployeesWithAttendance>
  bkoAssignments?: ReturnType<typeof getBKOAssignments>
  showSchedule?: boolean
  showLateDetails?: boolean
  isDayOffView?: boolean
  onViewDetails?: (employee: EmployeeWithAttendance) => void
}

function AttendanceTableContent({ records, bkoAssignments = [], showSchedule, showLateDetails, isDayOffView, onViewDetails }: AttendanceTableContentProps) {
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const severity = record.status === 'late' ? getLateCheckInSeverity(record.lateMinutes) : null
            const bkoInfo = bkoAssignments.find(b => b.employeeId === record.employeeId)
            return (
              <TableRow 
                key={record.employeeId}
                className={
                  record.status === 'late' 
                    ? 'bg-warning/5' 
                    : record.status === 'day-off' 
                      ? 'bg-primary/5' 
                      : bkoInfo
                        ? 'bg-blue-500/5'
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusStyles[record.status]}>
                      {statusLabels[record.status]}
                    </Badge>
                    {bkoInfo && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Badge variant="outline" className={`${bkoStyles} cursor-pointer`}>
                            <Shield className="size-3 mr-1" />
                            BKO
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64" align="start">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Backup Replacement</h4>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Currently working as</p>
                                  <p className="font-medium">{bkoInfo.backupEmployeeName}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Covering for</p>
                                  <p className="font-medium text-amber-600 dark:text-amber-400">{bkoInfo.originalEmployeeName}</p>
                                </div>
                                <div className="pt-2 border-t border-muted">
                                  <p className="text-muted-foreground">Status: On Leave</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {(record.checkInGps || record.checkInPhotoUrl) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(record)}
                      className="gap-1 text-primary hover:text-primary"
                    >
                      <MapPin className="size-3" />
                      <Camera className="size-3" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
