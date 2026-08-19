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
import { Clock, AlertTriangle, MapPin, Loader2, Eye, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GpsCoordinates } from '@/lib/constants'
import { formatAttendanceStatus, getAttendanceLabel, getStatusStyles, resolveAttendanceStatus } from '@/lib/attendance-utils'
import { AttendanceDetailsModal } from './attendance-details-modal'
import { getBusinessDateRangeForPreset, formatBusinessDate } from '@/lib/timezone'

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

export function AttendanceTable({ siteId = 'all', dateRange = 'today', customDateFrom = '', customDateTo = '', department = 'all', refreshKey = 0 }: { siteId?: string; dateRange?: string; customDateFrom?: string; customDateTo?: string; department?: string; refreshKey?: number }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 25, totalRecords: 0, totalPages: 0 })
  const [prefetchedPage, setPrefetchedPage] = useState<{ page: number; records: AttendanceRecord[]; pagination: typeof pagination } | null>(null)

  useEffect(() => {
    setPage(1)
  }, [siteId, dateRange, customDateFrom, customDateTo, department, pageSize])

  useEffect(() => {
    let cancelled = false
    setIsRefreshing(true)
    setError(null)
    setPrefetchedPage(null)
    const fetchAttendance = async () => {
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('pageSize', String(pageSize))
        if (siteId && siteId !== 'all') {
          params.append('siteId', siteId)
        }
        params.set('dateRange', dateRange || 'today')
        if (dateRange === 'custom' && customDateFrom && customDateTo) {
          params.set('dateFrom', customDateFrom)
          params.set('dateTo', customDateTo)
        } else {
          const range = getBusinessDateRangeForPreset(dateRange || 'today')
          params.set('dateFrom', range.dateFrom)
          params.set('dateTo', range.dateTo)
        }
        if (department && department !== 'all') {
          params.append('department', department)
        }

        const response = await fetch(`/api/attendance?${params.toString()}`)
        if (!response.ok) {
          const message = response.status === 401
            ? 'Your session has expired. Please sign in again.'
            : response.status === 403
              ? "You don't have permission to view this site's attendance."
              : response.status === 404
                ? 'The selected site could not be found.'
                : 'Attendance records could not be loaded. Please try again.'
          if (!cancelled) setError(message)
          return
        }
        const data = await response.json()
        if (!cancelled) {
          setRecords(Array.isArray(data.records) ? data.records : [])
          setPagination(data.pagination)
          setError(null)

          const nextPage = page + 1
          if (data.pagination?.totalPages >= nextPage) {
            const nextParams = new URLSearchParams(params)
            nextParams.set('page', String(nextPage))
            fetch(`/api/attendance?${nextParams.toString()}`, { priority: 'low' })
              .catch(() => undefined)
          }
        }
      } catch {
        if (!cancelled) setError('Attendance records could not be loaded. Please try again.')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    fetchAttendance()
    return () => { cancelled = true }
  }, [siteId, dateRange, customDateFrom, customDateTo, department, refreshKey, retryKey, page, pageSize])

  if (error && records.length === 0) {
    return (
      <Card role="alert">
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="font-medium text-destructive">Unable to load attendance records</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRetryKey((key) => key + 1)}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const allRecords = records
  const statusRecords = records.map((record) => ({ record, status: resolveAttendanceStatus(record) }))
  const lateRecords = statusRecords.filter(({ status }) => status === 'LATE').map(({ record }) => record)
  const presentRecords = statusRecords.filter(({ status }) => status === 'PRESENT').map(({ record }) => record)
  const absentRecords = statusRecords.filter(({ status }) => status === 'ABSENT').map(({ record }) => record)
  const pendingRecords = statusRecords.filter(({ status }) => status === 'NOT_CHECKED_IN').map(({ record }) => record)

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
            {record.date ? formatBusinessDate(record.date.slice(0, 10)) : '--'}
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">
            {record.actualCheckIn ? record.actualCheckIn.split('T')[1]?.substring(0, 5) || '--:--' : '--:--'}
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">
            {record.actualCheckOut ? record.actualCheckOut.split('T')[1]?.substring(0, 5) || '--:--' : '--:--'}
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={getStatusStyles(resolveAttendanceStatus(record))}>
              {getAttendanceLabel(resolveAttendanceStatus(record))}
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

  if (loading && records.length === 0) {
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
      <Card className={isRefreshing ? 'opacity-70 transition-opacity' : undefined} aria-busy={isRefreshing}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>
              {dateRange === 'yesterday' ? "Yesterday's Attendance" : dateRange === 'week' ? "This Week's Attendance" : dateRange === 'month' ? "This Month's Attendance" : dateRange === 'custom' && customDateFrom && customDateTo ? `Attendance: ${customDateFrom} – ${customDateTo}` : "Today's Attendance"}
            </CardTitle>
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
          {pagination.totalRecords > 0 && (
            <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, pagination.totalRecords)} of {pagination.totalRecords} records
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || isRefreshing} onClick={() => setPage((value) => Math.max(value - 1, 1))}>
                  <ChevronLeft className="mr-1 size-4" /> Previous
                </Button>
                <span className="px-2">Page {page} of {Math.max(pagination.totalPages, 1)}</span>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages || isRefreshing} onClick={() => setPage((value) => value + 1)}>
                  Next <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <AttendanceDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} record={selectedRecord} />
    </>
  )
}
