'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR, { preload } from 'swr'
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
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, AlertTriangle, MapPin, Loader2, Eye, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react'
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
    timezone?: 'WIB' | 'WITA' | 'WIT'
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
  isBko?: boolean
  bkoDetails?: {
    coveredEmployeeName: string
    startDate: string
    endDate: string
  } | null
}

async function fetchAttendancePage(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Your session has expired. Please sign in again.'
        : response.status === 403
          ? "You don't have permission to view this site's attendance."
          : response.status === 404
            ? 'The selected site could not be found.'
            : 'Attendance records could not be loaded. Please try again.'
    )
  }
  return response.json()
}

// Status formatting is now handled by attendance-utils.ts for consistent display across the app

const SITE_TIMEZONE_LABELS = {
  WIB: { label: 'WIB', utc: 'UTC+7', iana: 'Asia/Jakarta' },
  WITA: { label: 'WITA', utc: 'UTC+8', iana: 'Asia/Makassar' },
  WIT: { label: 'WIT', utc: 'UTC+9', iana: 'Asia/Jayapura' },
} as const

function getRecordTimezone(record: AttendanceRecord) {
  return SITE_TIMEZONE_LABELS[record.location?.timezone || 'WIB']
}

function formatRecordTime(value: string | null, record: AttendanceRecord) {
  if (!value) return '--:--'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: getRecordTimezone(record).iana,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function TimezoneTime({ value, record }: { value: string | null; record: AttendanceRecord }) {
  const timezone = getRecordTimezone(record)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help border-b border-dotted border-muted-foreground/50">
          {formatRecordTime(value, record)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{timezone.label} ({timezone.utc})</TooltipContent>
    </Tooltip>
  )
}

export function AttendanceTable({ siteId = 'all', dateRange = 'today', customDateFrom = '', customDateTo = '', department = 'all', refreshKey = 0 }: { siteId?: string; dateRange?: string; customDateFrom?: string; customDateTo?: string; department?: string; refreshKey?: number }) {
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const pageSize = 25
  const [employeeName, setEmployeeName] = useState('')
  const [searchName, setSearchName] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setSearchName(employeeName.trim()), 300)
    return () => clearTimeout(timeout)
  }, [employeeName])

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams()
    params.set('pageSize', String(pageSize))
    if (siteId && siteId !== 'all') params.set('siteId', siteId)
    params.set('dateRange', dateRange || 'today')
    if (dateRange === 'custom' && customDateFrom && customDateTo) {
      params.set('dateFrom', customDateFrom)
      params.set('dateTo', customDateTo)
    } else {
      const range = getBusinessDateRangeForPreset(dateRange || 'today')
      params.set('dateFrom', range.dateFrom)
      params.set('dateTo', range.dateTo)
    }
    if (department && department !== 'all') params.set('department', department)
    if (searchName) params.set('employeeName', searchName)
    if (refreshKey) params.set('refresh', String(refreshKey))
    return params.toString()
  }, [siteId, dateRange, customDateFrom, customDateTo, department, searchName, refreshKey])

  // Page is tied to the filters it was chosen under, so changing a filter starts at page 1
  // without an extra render that would request the old page with the new filters.
  const [pageState, setPageState] = useState({ filterQuery, page: 1 })
  const page = pageState.filterQuery === filterQuery ? pageState.page : 1
  const setPage = (update: (value: number) => number) => setPageState({ filterQuery, page: update(page) })

  const rowsKey = (targetPage: number) => `/api/attendance?${filterQuery}&view=rows&page=${targetPage}`
  const rowsQuery = useSWR<{ records: AttendanceRecord[] }>(rowsKey(page), fetchAttendancePage, { keepPreviousData: true })
  const countsQuery = useSWR<{ totalRecords: number; statusCounts: Record<string, number> }>(
    `/api/attendance?${filterQuery}&view=counts`,
    fetchAttendancePage,
    { keepPreviousData: true }
  )

  const records = rowsQuery.data?.records ?? []
  const statusCounts = countsQuery.data?.statusCounts ?? {}
  const totalRecords = countsQuery.data?.totalRecords ?? 0
  const pagination = { page, pageSize, totalRecords, totalPages: Math.ceil(totalRecords / pageSize) }
  const loading = !rowsQuery.data && !rowsQuery.error
  const isRefreshing = rowsQuery.isLoading
  const error = (rowsQuery.error || countsQuery.error)?.message ?? null
  const retry = () => {
    rowsQuery.mutate()
    countsQuery.mutate()
  }
  const preloadNextPage = () => {
    if (page < pagination.totalPages) preload(rowsKey(page + 1), fetchAttendancePage)
  }

  if (error && records.length === 0) {
    return (
      <Card role="alert">
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="font-medium text-destructive">Unable to load attendance records</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const allRecords = records
  const statusRecords = records.map((record) => ({ record, status: resolveAttendanceStatus(record) }))
  const totalStatusCount = (status: string) => statusCounts[status] ?? statusRecords.filter((item) => item.status === status).length
  const lateRecords = statusRecords.filter(({ status }) => status === 'LATE').map(({ record }) => record)
  const presentRecords = statusRecords.filter(({ status }) => status === 'PRESENT').map(({ record }) => record)
  const absentRecords = statusRecords.filter(({ status }) => status === 'ABSENT').map(({ record }) => record)
  const pendingRecords = statusRecords.filter(({ status }) => status === 'NOT_CHECKED_IN').map(({ record }) => record)

  const openGoogleMaps = (gps: GpsCoordinates) => {
    const url = `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`
    window.open(url, '_blank')
  }

  const renderTableRows = (data: AttendanceRecord[]) => (
    <TooltipProvider>
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
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{record.user?.name}</p>
                  {record.isBko && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="h-5 border-blue-200 bg-blue-50 px-1.5 text-[10px] font-semibold text-blue-700">
                          BKO
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        BKO backup replacement for {record.bkoDetails?.coveredEmployeeName || 'another employee'}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
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
            <TimezoneTime value={record.actualCheckIn} record={record} />
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">
            <TimezoneTime value={record.actualCheckOut} record={record} />
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
    </TooltipProvider>
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
          {pagination.totalRecords > 0 && (
            <Badge variant="outline">
              {pagination.totalRecords} total records
            </Badge>
          )}
        </CardHeader>
          <CardContent>
            <div className="mb-4 max-w-sm">
              <label htmlFor="attendance-name-search" className="sr-only">Search attendance by employee name</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="attendance-name-search"
                  value={employeeName}
                  onChange={(event) => setEmployeeName(event.target.value)}
                  placeholder="Search by employee name"
                  className="pl-9"
                />
              </div>
            </div>
            <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({pagination.totalRecords})</TabsTrigger>
              <TabsTrigger value="late" className="text-warning">Late ({totalStatusCount('LATE')})</TabsTrigger>
              <TabsTrigger value="present" className="text-success">Present ({totalStatusCount('PRESENT')})</TabsTrigger>
              <TabsTrigger value="absent" className="text-destructive">Absent ({totalStatusCount('ABSENT')})</TabsTrigger>
              <TabsTrigger value="pending" className="text-orange-500">Pending ({totalStatusCount('NOT_CHECKED_IN')})</TabsTrigger>
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
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages || isRefreshing} onMouseEnter={preloadNextPage} onFocus={preloadNextPage} onClick={() => setPage((value) => value + 1)}>
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
