'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Calendar, 
  Plus, 
  Download, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle,
  Sun,
  Sunset,
  Moon
} from 'lucide-react'
import { 
  shifts, 
  employeeSchedules, 
  locations, 
  formatTime,
  getLateCheckIns,
  todayAttendance,
  dayNamesShort,
  getEmployeesOnDayOff
} from '@/lib/data'

const shiftIcons = {
  morning: Sun,
  day: Sun,
  evening: Sunset,
  night: Moon,
}

export default function ShiftsPage() {
  const lateCheckIns = getLateCheckIns()
  
  // Get employees by shift with their attendance status
  const getShiftEmployees = (shiftId: string) => {
    return employeeSchedules
      .filter(s => s.shiftId === shiftId)
      .map(schedule => {
        const attendance = todayAttendance.find(a => a.employeeId === schedule.employeeId)
        const location = locations.find(l => l.id === schedule.locationId)
        const isLate = attendance?.status === 'late'
        return {
          ...schedule,
          locationName: location?.name || 'Unknown',
          status: attendance?.status || 'not-checked-in',
          lateMinutes: attendance?.lateMinutes || 0,
          actualCheckIn: attendance?.actualCheckIn || null,
          isLate,
        }
      })
  }

  // Calculate shift statistics
  const getShiftStats = (shiftId: string) => {
    const employees = getShiftEmployees(shiftId)
    const total = employees.length
    const present = employees.filter(e => e.status === 'present' || e.status === 'late').length
    const late = employees.filter(e => e.status === 'late').length
    const absent = employees.filter(e => e.status === 'absent').length
    return { total, present, late, absent }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shift Schedule</h1>
          <p className="text-muted-foreground">
            Manage and organize security personnel shifts with real-time attendance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 size-4" />
            Create Shift
          </Button>
        </div>
      </div>

      {/* Late Check-ins Alert */}
      {lateCheckIns.length > 0 && (
        <Card className="bg-warning/5 border-warning/30">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="size-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {lateCheckIns.length} late check-ins today
              </p>
              <p className="text-sm text-muted-foreground">
                {lateCheckIns.map(l => l.employeeName).slice(0, 3).join(', ')}
                {lateCheckIns.length > 3 && ` and ${lateCheckIns.length - 3} more`}
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shift Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shifts.map((shift) => {
          const stats = getShiftStats(shift.id)
          const ShiftIcon = shiftIcons[shift.id as keyof typeof shiftIcons] || Clock
          const hasLate = stats.late > 0

          return (
            <Card 
              key={shift.id} 
              className={`bg-card border-border ${hasLate ? 'ring-1 ring-warning/50' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShiftIcon className="size-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{shift.name}</CardTitle>
                  </div>
                  {hasLate && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                      {stats.late} late
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-mono">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Grace Period</span>
                    <span>{shift.gracePeriodMinutes} min</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {stats.total} assigned
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-success">{stats.present} present</span>
                        {hasLate && <span className="text-warning">{stats.late} late</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Shift View */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Shift Assignments</CardTitle>
          <CardDescription>
            Personnel assigned to each shift with real-time check-in status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={shifts[0].id}>
            <TabsList className="mb-4">
              {shifts.map((shift) => {
                const stats = getShiftStats(shift.id)
                return (
                  <TabsTrigger key={shift.id} value={shift.id} className="gap-2">
                    {shift.name}
                    {stats.late > 0 && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs ml-1">
                        {stats.late}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {shifts.map((shift) => {
              const employees = getShiftEmployees(shift.id)
              
              return (
                <TabsContent key={shift.id} value={shift.id}>
                  <div className="rounded-lg border border-border">
                    <div className="p-4 bg-muted/30 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{shift.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)} | Grace period: {shift.gracePeriodMinutes} min
                          </p>
                        </div>
                        <Badge variant="outline">
                          {employees.length} personnel
                        </Badge>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="divide-y divide-border">
                        {employees.map((employee) => (
                          <div 
                            key={employee.employeeId}
                            className={`flex items-center justify-between p-4 ${
                              employee.isLate ? 'bg-warning/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarImage src={`/avatars/${employee.employeeId}.jpg`} alt={employee.employeeName} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {employee.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{employee.employeeName}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{employee.position}</span>
                                  <span>|</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {employee.locationName}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                {employee.actualCheckIn ? (
                                  <>
                                    <p className={`text-sm font-mono ${employee.isLate ? 'text-warning' : ''}`}>
                                      {formatTime(employee.actualCheckIn)}
                                    </p>
                                    {employee.isLate && (
                                      <p className="text-xs text-destructive">
                                        +{employee.lateMinutes} min late
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-sm text-muted-foreground">Not checked in</p>
                                )}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={
                                  employee.status === 'present' ? 'bg-success/10 text-success border-success/20' :
                                  employee.status === 'late' ? 'bg-warning/10 text-warning border-warning/20' :
                                  employee.status === 'absent' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                  employee.status === 'leave' ? 'bg-chart-2/10 text-chart-2 border-chart-2/20' :
                                  'bg-muted text-muted-foreground'
                                }
                              >
                                {employee.status === 'not-checked-in' ? 'Pending' : 
                                 employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
