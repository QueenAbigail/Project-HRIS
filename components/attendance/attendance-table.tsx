'use client'

import { useEffect, useState } from 'react'
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
import { Clock, AlertTriangle, MapPin, Camera, Navigation, ExternalLink, Shield, Loader2 } from 'lucide-react'
import type { GpsCoordinates } from '@/lib/constants'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  initials: string
  department: string
  position: string
  location: string
  scheduledStart: string
  scheduledEnd: string
  checkIn: string | null
  checkOut: string | null
  status: 'present' | 'late' | 'absent' | 'leave' | 'not-checked-in' | 'day-off'
  lateMinutes: number
  workHours: string
  checkInGps: GpsCoordinates | null
  checkOutGps: GpsCoordinates | null
  checkInPhotoUrl: string | null
  checkOutPhotoUrl: string | null
}

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

export function AttendanceTable({ siteId = 'all' }: { siteId?: string }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const params = new URLSearchParams()
        if (siteId && siteId !== 'all') {
          params.append('siteId', siteId)
        }

        const response = await fetch(`/api/attendance?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setRecords(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('[v0] Failed to fetch attendance records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [siteId])

  const allRecords = records
  const lateRecords = records.filter(r => r.status === 'late')
  const presentRecords = records.filter(r => r.status === 'present')
  const absentRecords = records.filter(r => r.status === 'absent' || r.status === 'not-checked-in')
  const dayOffRecords = records.filter(r => r.status === 'day-off')

  const openGoogleMaps = (gps: GpsCoordinates) => {
    const url = `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`
    window.open(url, '_blank')
  }

  const renderTableRows = (data: AttendanceRecord[]) => (
    <>
      {data.map((record) => (
        <TableRow key={record.id}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {record.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm">{record.employeeName}</p>
                <p className="text-xs text-muted-foreground">{record.department}</p>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-sm">{record.location}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.scheduledStart}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.checkIn || '--:-- --'}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.checkOut || '--:-- --'}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.workHours}</TableCell>
          <TableCell>
            <Badge variant="outline" className={statusStyles[record.status]}>
              {statusLabels[record.status]}
            </Badge>
          </TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRecord(record)
                setDetailsOpen(true)
              }}
            >
              <ExternalLink className="size-4" />
              View
            </Button>
          </TableCell>
        </TableRow>
      ))}
      {data.length === 0 && (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
            No records found
          </TableCell>
        </TableRow>
      )}
    </>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              Attendance records with schedule integration
            </CardDescription>
          </div>
          {records.length > 0 && (
            <Badge variant="outline">
              {records.length} records
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({allRecords.length})</TabsTrigger>
              <TabsTrigger value="late" className="text-warning">Late ({lateRecords.length})</TabsTrigger>
              <TabsTrigger value="present" className="text-success">Present ({presentRecords.length})</TabsTrigger>
              <TabsTrigger value="absent" className="text-destructive">Absent ({absentRecords.length})</TabsTrigger>
              <TabsTrigger value="day-off">Day Off ({dayOffRecords.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableRows(allRecords)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="late" className="mt-4">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableRows(lateRecords)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="present" className="mt-4">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableRows(presentRecords)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="absent" className="mt-4">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableRows(absentRecords)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="day-off" className="mt-4">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableRows(dayOffRecords)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              Attendance Details - {selectedRecord?.employeeName}
            </DialogTitle>
            <DialogDescription>
              GPS location and selfie verification for check-in/check-out
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedRecord.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold">{selectedRecord.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.department} - {selectedRecord.position}</p>
                  <p className="text-xs text-muted-foreground">{selectedRecord.location}</p>
                </div>
              </div>

              {/* Check-in Details */}
              {selectedRecord.checkIn && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="size-4" />
                    Check-in: {selectedRecord.checkIn}
                  </h3>
                  
                  {selectedRecord.checkInPhotoUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Camera className="size-4" />
                        Selfie Verification
                      </p>
                      <img 
                        src={selectedRecord.checkInPhotoUrl} 
                        alt="Check-in selfie" 
                        className="w-full max-w-xs rounded-lg border"
                      />
                    </div>
                  )}

                  {selectedRecord.checkInGps && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Navigation className="size-4" />
                        GPS Location
                      </p>
                      <div className="text-xs space-y-1 bg-muted p-2 rounded">
                        <p>Latitude: {selectedRecord.checkInGps.latitude}</p>
                        <p>Longitude: {selectedRecord.checkInGps.longitude}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGoogleMaps(selectedRecord.checkInGps!)}
                          className="mt-2"
                        >
                          <ExternalLink className="size-4 mr-2" />
                          View on Maps
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Check-out Details */}
              {selectedRecord.checkOut && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="size-4" />
                    Check-out: {selectedRecord.checkOut}
                  </h3>

                  {selectedRecord.checkOutPhotoUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Camera className="size-4" />
                        Selfie Verification
                      </p>
                      <img 
                        src={selectedRecord.checkOutPhotoUrl} 
                        alt="Check-out selfie" 
                        className="w-full max-w-xs rounded-lg border"
                      />
                    </div>
                  )}

                  {selectedRecord.checkOutGps && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Navigation className="size-4" />
                        GPS Location
                      </p>
                      <div className="text-xs space-y-1 bg-muted p-2 rounded">
                        <p>Latitude: {selectedRecord.checkOutGps.latitude}</p>
                        <p>Longitude: {selectedRecord.checkOutGps.longitude}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openGoogleMaps(selectedRecord.checkOutGps!)}
                          className="mt-2"
                        >
                          <ExternalLink className="size-4 mr-2" />
                          View on Maps
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
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
