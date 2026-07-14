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
import { Clock, AlertTriangle, MapPin, Loader2, Eye } from 'lucide-react'
import type { GpsCoordinates } from '@/lib/constants'
import { formatAttendanceStatus, getAttendanceLabel, getStatusStyles } from '@/lib/attendance-utils'
import { AttendanceDetailsModal } from './attendance-details-modal'

interface AttendanceRecord {
  id: string
  date: string
  userId: string
  user: {
    id: string
    name: string
    email: string
    employeeCode: string
    initials: string | null
    department: string | null
    position: string | null
  }
  locationId: string
  location: {
    id: string
    name: string
    code: string
    company: {
      name: string
    } | null
  } | null
  shiftId: string | null
  shift: {
    id: string
    name: string
    startTime: string
    endTime: string
  } | null
  scheduledStart: string | null
  scheduledEnd: string | null
  actualCheckIn: string | null
  actualCheckOut: string | null
  status: string
  lateMinutes: number
  gpsLat: number | null
  gpsLng: number | null
  gpsLatPulang: number | null
  gpsLngPulang: number | null
  selfieCheckIn: string | null
  selfieCheckOut: string | null
  notes: string | null
}

// Status formatting is now handled by attendance-utils.ts for consistent display across the app

export function AttendanceTable({ siteId = 'all', dateRange = 'today', department = 'all' }: { siteId?: string; dateRange?: string; department?: string }) {
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
        if (dateRange) {
          params.append('dateRange', dateRange)
        }
        if (department && department !== 'all') {
          params.append('department', department)
        }

        const url = `/api/attendance?${params.toString()}`
        console.log("[v0] Fetching attendance from:", url)
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Attendance data received:", data)
          setRecords(Array.isArray(data) ? data : [])
        } else {
          const errorText = await response.text()
          console.error("[v0] API error response:", errorText)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch attendance records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [siteId, dateRange, department])

  const allRecords = records
  const lateRecords = records.filter(r => r.status === 'LATE')
  const presentRecords = records.filter(r => r.status === 'PRESENT')
  const absentRecords = records.filter(r => r.status === 'ABSENT')
  const pendingRecords = records.filter(r => r.status === 'NOT_CHECKED_IN')

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
                  {record.user?.initials || record.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm">{record.user?.name}</p>
                <p className="text-xs text-muted-foreground">{record.user?.department || '--'}</p>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-sm">
            {typeof record.location === 'string' 
              ? record.location 
              : record.location 
                ? `${record.location.company?.name ? record.location.company.name + ' - ' : ''}${record.location.name}`
                : 'Unknown'}
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">
            {record.date ? new Date(record.date).toLocaleDateString() : '--'}
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">
            {record.actualCheckIn ? record.actualCheckIn.split('T')[1]?.substring(0, 5) || '--:--' : '--:--'}
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">
            {record.actualCheckOut ? record.actualCheckOut.split('T')[1]?.substring(0, 5) || '--:--' : '--:--'}
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={getStatusStyles(record.status)}>
              {getAttendanceLabel(record.status)}
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
              <Eye className="size-4" />
              View
            </Button>
          </TableCell>
        </TableRow>
      ))}
      {data.length === 0 && (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
              <TabsTrigger value="pending" className="text-orange-500">Pending ({pendingRecords.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
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

            <TabsContent value="pending" className="mt-4">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTableRows(pendingRecords)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <AttendanceDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} record={selectedRecord} />
    </>
  )
}
