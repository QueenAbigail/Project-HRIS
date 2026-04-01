'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'

export function AttendanceCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pb-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </CardContent>
      <CardContent className="pt-0 border-t border-border">
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Full Attendance</span>
            </div>
            <span className="font-medium">18 days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Partial</span>
            </div>
            <span className="font-medium">5 days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Low Attendance</span>
            </div>
            <span className="font-medium">2 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
