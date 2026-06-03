'use client'

import { useState, useEffect } from 'react'
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
import { AttendanceCalendar } from './attendance-calendar'
import { MarkAttendanceDialog } from './mark-attendance-dialog'

interface MasterDataItem {
  id: string
  value: string
  category: string
}

export function AttendanceHeader({ siteId = 'all' }: { siteId?: string }) {
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
          <div className="w-full sm:w-auto">
            <MarkAttendanceDialog />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Date Range:</span>
            </div>
            <Select defaultValue="today">
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
            <Select defaultValue="all">
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
            <AttendanceCalendar siteId={siteId} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
