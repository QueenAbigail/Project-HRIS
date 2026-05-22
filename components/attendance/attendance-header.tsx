'use client'

import { useState } from 'react'
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

export function AttendanceHeader({ siteId = 'all' }: { siteId?: string }) {
  const [openCalendarSheet, setOpenCalendarSheet] = useState(false)

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
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <MarkAttendanceDialog />
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="field">Field Security</SelectItem>
              <SelectItem value="surveillance">Surveillance</SelectItem>
              <SelectItem value="patrol">Patrol</SelectItem>
              <SelectItem value="admin">Administration</SelectItem>
            </SelectContent>
          </Select>
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
