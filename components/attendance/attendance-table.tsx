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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Clock, AlertTriangle, MapPin, Camera, Navigation, ExternalLink, Loader2 } from 'lucide-react'
import type { GpsCoordinates } from '@/lib/constants'

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
          <TableCell className="text-xs text-muted-foreground">{record.checkIn || '--:--'}</TableCell>
          <TableCell className="text-xs text-muted-foreground">{record.checkOut || '--:--'}</TableCell>
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

              {/* Late Warning */}
              {selectedRecord.status === 'late' && selectedRecord.lateMinutes > 0 && (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="size-4" />
                    <span className="font-medium">Late by {selectedRecord.lateMinutes} minutes</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
