'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Edit, Trash2, Search, ShieldAlert, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { formatTime } from '@/lib/data'
import type { ScheduleDateRange } from '@/app/superadmin/actions'
import type { Shift } from '@/lib/constants'

export interface Schedule {
  id: string
  employeeId: string
  employeeName: string
  shiftId: string
  shiftName: string
  shiftStart: string
  shiftEnd: string
  scheduleDate: Date | string
  employeeEmail?: string
  isException?: boolean
  notes?: string | null
}

export type { Shift }

export interface Employee {
  id: string
  employeeCode?: string | null
  name: string
  email?: string | null
}

interface ScheduleTableProps {
  schedules: Schedule[]
  onEdit?: (schedule: Schedule) => void
  onDelete?: (scheduleId: string) => void
  onRefresh?: () => void
  dateRange?: ScheduleDateRange
  onDateRangeChange?: (dateRange: ScheduleDateRange) => void
}

export function ScheduleTable({ schedules, onEdit, onDelete, onRefresh, dateRange = 'upcoming', onDateRangeChange }: ScheduleTableProps) {
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null)
  const [protectedDateConfirmed, setProtectedDateConfirmed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = schedules
    .filter(s => {
      // Filter by search (name, ID, shift, and date)
      const searchLower = search.toLowerCase()
      const scheduleDate = new Date(s.scheduleDate)
      const formattedDate = scheduleDate.toLocaleDateString('en-GB') // dd/mm/yyyy
      
      const matchesSearch =
        s.employeeName.toLowerCase().includes(searchLower) ||
        s.employeeId.toLowerCase().includes(searchLower) ||
        s.shiftName.toLowerCase().includes(searchLower) ||
        formattedDate.includes(searchLower) ||
        String(s.scheduleDate).includes(searchLower) // yyyy-mm-dd format

      if (!matchesSearch) return false

      const scheduleDateCheck = new Date(s.scheduleDate)
      scheduleDateCheck.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const past7Start = new Date(today)
      past7Start.setDate(past7Start.getDate() - 7)
      const past30Start = new Date(today)
      past30Start.setDate(past30Start.getDate() - 30)

      if (dateRange === 'upcoming') return scheduleDateCheck >= today
      if (dateRange === 'today') return scheduleDateCheck >= today && scheduleDateCheck < tomorrow
      if (dateRange === 'yesterday') return scheduleDateCheck >= yesterday && scheduleDateCheck < today
      if (dateRange === 'past7') return scheduleDateCheck >= past7Start && scheduleDateCheck < today
      if (dateRange === 'past30') return scheduleDateCheck >= past30Start && scheduleDateCheck < today
      return true
    })
    .sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime())

  useEffect(() => {
    setCurrentPage(1)
  }, [search, dateRange])

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const paginatedSchedules = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = async (id: string, allowProtectedDateChange = false) => {
    try {
      setDeleting(id)
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowProtectedDateChange }),
      })

      if (!response.ok) throw new Error('Delete failed')

      toast.success('Schedule deleted')
      onRefresh?.()
    } catch (error) {
      toast.error('Failed to delete schedule')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, shift, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
          <Label htmlFor="schedule-date-range" className="text-sm text-muted-foreground">Date range</Label>
          <Select value={dateRange} onValueChange={(value) => onDateRangeChange?.(value as ScheduleDateRange)}>
            <SelectTrigger id="schedule-date-range" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="past7">Past 7 days</SelectItem>
              <SelectItem value="past30">Past 30 days</SelectItem>
              <SelectItem value="all">All dates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No schedules found</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchedules.map((schedule) => (
                <TableRow key={schedule.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{schedule.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{schedule.employeeId}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.scheduleDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.shiftName}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {formatTime(schedule.shiftStart)} - {formatTime(schedule.shiftEnd)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit?.(schedule)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          setScheduleToDelete(schedule)
                          setProtectedDateConfirmed(false)
                        }}
                        disabled={deleting === schedule.id}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={Boolean(scheduleToDelete)} onOpenChange={(open) => !open && setScheduleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the {scheduleToDelete?.shiftName} schedule for {scheduleToDelete?.employeeName} on{' '}
              {scheduleToDelete && new Date(scheduleToDelete.scheduleDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}. This action cannot be undone.
            </AlertDialogDescription>
            {scheduleToDelete && new Date(scheduleToDelete.scheduleDate) <= new Date() && (
              <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden="true" />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400">Additional confirmation required</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This schedule is from today or earlier and may be referenced by attendance records.
                      </p>
                    </div>
                    <label className="flex items-start gap-2 text-sm">
                      <Checkbox
                        checked={protectedDateConfirmed}
                        onCheckedChange={(checked) => setProtectedDateConfirmed(checked === true)}
                        className="mt-0.5"
                      />
                      <span>I understand the impact and want to continue.</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deleting)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={Boolean(deleting) || Boolean(scheduleToDelete && new Date(scheduleToDelete.scheduleDate) <= new Date() && !protectedDateConfirmed)}
              onClick={() => {
                if (scheduleToDelete) {
                  const isProtectedDate = new Date(scheduleToDelete.scheduleDate) <= new Date()
                  if (isProtectedDate && !protectedDateConfirmed) return
                  handleDelete(scheduleToDelete.id, isProtectedDate)
                }
              }}
            >
              {deleting ? 'Deleting...' : 'Delete schedule'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {filtered.length === 0
            ? 'Showing 0 of 0 schedules'
            : `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filtered.length)} of ${filtered.length} schedules`}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
              disabled={safeCurrentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (safeCurrentPage <= 3) {
                  pageNum = i + 1
                } else if (safeCurrentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = safeCurrentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={safeCurrentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
