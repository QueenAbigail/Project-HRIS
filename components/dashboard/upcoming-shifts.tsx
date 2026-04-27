'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, Calendar } from 'lucide-react'
import { employeeSchedules, shifts, locations, todayAttendance } from '@/lib/constants'
import { formatTime } from '@/lib/data'

interface UpcomingShiftsProps {
  data: Array<any>
}

export function UpcomingShifts({ data }: UpcomingShiftsProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Shifts</CardTitle>
              <CardDescription>Today's scheduled assignments</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">No shifts</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Belum ada jadwal shift hari ini</p>
            <p className="text-sm text-muted-foreground">Jadwal akan muncul setelah diassign</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const lateCount = data.filter((s) => s.isLate).length;

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
            {data.map((shift) => (
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
