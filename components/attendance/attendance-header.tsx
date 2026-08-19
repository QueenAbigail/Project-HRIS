'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { MarkAttendanceDialog } from './mark-attendance-dialog'
import { Loader2 } from 'lucide-react'

// Lazy load the calendar component - only loads when sheet is opened
const AttendanceCalendar = dynamic(() => import('./attendance-calendar').then(mod => ({ default: mod.AttendanceCalendar })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
})

interface MasterDataItem {
  id: string
  value: string
  category: string
}

interface AttendanceHeaderProps {
  siteId?: string
  dateRange?: string
  customDateFrom?: string
  customDateTo?: string
  onDateRangeChange?: (range: string, dateFrom?: string, dateTo?: string) => void
  selectedDepartment?: string
  onDepartmentChange?: (dept: string) => void
  isClient?: boolean
}

export function AttendanceHeader({ 
  siteId = 'all',
  dateRange = 'today',
  customDateFrom = '',
  customDateTo = '',
  onDateRangeChange,
  selectedDepartment = 'all',
  onDepartmentChange,
  isClient = false
}: AttendanceHeaderProps) {
  const [openCalendarSheet, setOpenCalendarSheet] = useState(false)
  const [departments, setDepartments] = useState<MasterDataItem[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [customOpen, setCustomOpen] = useState(false)
  const [draftDateFrom, setDraftDateFrom] = useState(customDateFrom)
  const [draftDateTo, setDraftDateTo] = useState(customDateTo)

  const openCustomRange = () => {
    setDraftDateFrom(customDateFrom)
    setDraftDateTo(customDateTo)
    setCustomOpen(true)
  }

  const applyCustomRange = () => {
    if (!draftDateFrom || !draftDateTo || draftDateFrom > draftDateTo) return
    onDateRangeChange?.('custom', draftDateFrom, draftDateTo)
    setCustomOpen(false)
  }

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/master-data?category=department')
        if (response.ok) {
          const data = await response.json()
          setDepartments(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error)
      } finally {
        setLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">
              Track and manage employee attendance records
            </p>
          </div>
          {!isClient && (
            <div className="w-full sm:w-auto">
              <MarkAttendanceDialog />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Date Range:</span>
            </div>
            <Select value={dateRange} onValueChange={(value) => value === 'custom' ? openCustomRange() : onDateRangeChange?.(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {dateRange === 'custom' && (
              <Button type="button" variant="outline" onClick={openCustomRange} className="w-full sm:w-auto">
                {customDateFrom && customDateTo ? `${customDateFrom} – ${customDateTo}` : 'Choose dates'}
              </Button>
            )}
            <Select value={selectedDepartment} onValueChange={(value) => onDepartmentChange?.(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={loadingDepartments ? "Loading..." : "Department"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.value}>
                    {dept.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline"
            onClick={() => setOpenCalendarSheet(true)}
            className="w-full sm:w-auto"
          >
            <Calendar className="mr-2 size-4" />
            Calendar
          </Button>
        </div>
      </div>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
            <DialogDescription>Choose the same period for attendance cards and table.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="attendance-date-from">Start Date</Label>
              <Input id="attendance-date-from" type="date" value={draftDateFrom} onChange={(event) => setDraftDateFrom(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attendance-date-to">End Date</Label>
              <Input id="attendance-date-to" type="date" value={draftDateTo} min={draftDateFrom || undefined} onChange={(event) => setDraftDateTo(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCustomOpen(false)}>Cancel</Button>
            <Button type="button" disabled={!draftDateFrom || !draftDateTo || draftDateFrom > draftDateTo} onClick={applyCustomRange}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={openCalendarSheet} onOpenChange={setOpenCalendarSheet}>
        <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Attendance Calendar</SheetTitle>
            <SheetDescription>
              View attendance records and statistics by date
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {openCalendarSheet && (
              <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>}>
                <AttendanceCalendar siteId={siteId} />
              </Suspense>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
