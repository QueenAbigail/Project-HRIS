'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle } from 'lucide-react'
import { employeeSchedules, shifts, locations, todayAttendance, formatTime } from '@/lib/data'

export function UpcomingShifts() {
  // Get upcoming shift assignments with their status
  const upcomingShifts = employeeSchedules.slice(0, 6).map(schedule => {
    const shift = shifts.find(s => s.id === schedule.shiftId)!
    const location = locations.find(l => l.id === schedule.locationId)!
    const attendance = todayAttendance.find(a => a.employeeId === schedule.employeeId)
    
    return {
      id: schedule.employeeId,
      employee: schedule.employeeName,
      initials: schedule.initials,
      location: location.name,
      time: `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`,
      type: shift.name,
      status: attendance?.status || 'not-checked-in',
      isLate: attendance?.status === 'late',
      lateMinutes: attendance?.lateMinutes || 0,
    }
  })

  const lateCount = upcomingShifts.filter(s => s.isLate).length

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Shifts</CardTitle>
            <CardDescription>Today&apos;s scheduled assignments</CardDescription>
          </div>
          {lateCount > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
              <AlertTriangle className="size-3 mr-1" />
              {lateCount} late
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 p-6 pt-0">
            {upcomingShifts.map((shift) => (
              <div 
                key={shift.id} 
                className={`flex items-center gap-3 ${shift.isLate ? 'bg-warning/5 -mx-2 px-2 py-1 rounded-lg' : ''}`}
              >
                <Avatar className="size-9">
                  <AvatarImage src={`/avatars/${shift.id}.jpg`} alt={shift.employee} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {shift.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{shift.employee}</p>
                    {shift.isLate && (
                      <span className="text-xs text-destructive">+{shift.lateMinutes}min</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{shift.location}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={
                      shift.status === 'present' ? 'bg-success/10 text-success border-success/20' :
                      shift.status === 'late' ? 'bg-warning/10 text-warning border-warning/20' :
                      shift.status === 'absent' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'text-xs'
                    }
                  >
                    {shift.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{shift.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
