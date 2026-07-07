'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
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
  onDateRangeChange?: (range: string) => void
  selectedDepartment?: string
  onDepartmentChange?: (dept: string) => void
  isClient?: boolean
}

export function AttendanceHeader({ 
  siteId = 'all',
  dateRange = 'today',
  onDateRangeChange,
  selectedDepartment = 'all',
  onDepartmentChange,
  isClient = false
}: AttendanceHeaderProps) {
  const [openCalendarSheet, setOpenCalendarSheet] = useState(false)
  const [departments, setDepartments] = useState<MasterDataItem[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

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
            <Select value={dateRange} onValueChange={(value) => onDateRangeChange?.(value)}>
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
