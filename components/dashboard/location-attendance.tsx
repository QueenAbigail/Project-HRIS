'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, Users, UserCheck, UserX, Clock, AlertTriangle, CalendarOff } from 'lucide-react'
// import { getLocationAttendanceStats, getOverallAttendanceStats } from '@/lib/data'

interface LocationAttendanceProps {
  locationData?: Array<any>
}

export function LocationAttendance({ locationData }: LocationAttendanceProps) {
  const router = useRouter()

  const handleLocationClick = (siteId: string) => {
    router.push(`/dashboard/attendance?site=${siteId}`)
  }

  if (!locationData || locationData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Attendance by Location
          </CardTitle>
          <CardDescription>Real-time status across all client sites</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Belum ada data attendance</p>
            <p className="text-sm text-muted-foreground">Lokasi akan muncul setelah data tersedia</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = {
    totalStaff: locationData.reduce((acc, loc) => acc + loc.totalStaff, 0),
    present: locationData.reduce((acc, loc) => acc + loc.present + loc.late, 0),
    absent: locationData.reduce((acc, loc) => acc + loc.absent, 0),
    late: locationData.reduce((acc, loc) => acc + loc.late, 0),
    notCheckedIn: locationData.reduce((acc, loc) => acc + loc.notCheckedIn, 0),
    onLeave: locationData.reduce((acc, loc) => acc + loc.onLeave, 0),
    dayOff: locationData.reduce((acc, loc) => acc + loc.dayOff, 0),
    expectedToWork: locationData.reduce((acc, loc) => acc + loc.expectedToWork, 0),
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Attendance by Location
            </CardTitle>
            <CardDescription>Real-time status across all client sites</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Late</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">Not Checked In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-primary/50" />
              <span className="text-muted-foreground">Day Off</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totals.totalStaff}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
              <UserCheck className="size-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{totals.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="size-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{totals.late}</p>
              <p className="text-xs text-muted-foreground">Late Check-Ins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <UserX className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{totals.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">{totals.notCheckedIn}</p>
              <p className="text-xs text-muted-foreground">Not Checked In</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarOff className="size-5 text-primary/70" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary/70">{totals.dayOff}</p>
              <p className="text-xs text-muted-foreground">Day Off</p>
            </div>
          </div>
        </div>

        {/* Avg Late Minutes Alert */}
        {totals.late > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="size-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {totals.late} late check-ins today
              </p>
              <p className="text-xs text-muted-foreground">
                Average delay: 0 minutes | Total late time: 0 minutes
              </p>
            </div>
          </div>
        )}

        {/* Location Breakdown */}
        <div className="space-y-3">
{locationData.map((location) => {
            const attendanceRate = location.attendanceRate
            const hasLateCheckIns = location.late > 0
            const hasDayOff = location.dayOff > 0
            return (
              <button
                onClick={() => handleLocationClick(location.locationId)}
                key={location.locationId}
                className={`w-full text-left p-4 rounded-lg border bg-secondary/20 hover:bg-secondary/40 hover:border-primary/50 transition-all cursor-pointer ${
                  hasLateCheckIns ? 'border-warning/30' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-muted flex items-center justify-center">
                      <MapPin className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{location.locationName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{location.locationId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDayOff && (
                      <Badge 
                        variant="outline" 
                        className="bg-primary/10 text-primary/70 border-primary/20"
                      >
                        {location.dayOff} day off
                      </Badge>
                    )}
                    {hasLateCheckIns && (
                      <Badge 
                        variant="outline" 
                        className="bg-warning/10 text-warning border-warning/20"
                      >
                        {location.late} late
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        attendanceRate >= 90
                          ? 'bg-success/10 text-success border-success/20'
                          : attendanceRate >= 75
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }
                    >
                      {attendanceRate}% Present
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={attendanceRate} className="h-2" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1">
                        <UserCheck className="size-3 text-success" />
                        {location.present} on-time
                      </span>
                      {hasLateCheckIns && (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="size-3 text-warning" />
                          {location.late} late ({location.lateMinutesTotal}min)
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <UserX className="size-3 text-destructive" />
                        {location.absent} absent
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        {location.notCheckedIn} pending
                      </span>
                      {hasDayOff && (
                        <span className="flex items-center gap-1">
                          <CalendarOff className="size-3 text-primary/70" />
                          {location.dayOff} off
                        </span>
                      )}
                    </div>
                    <span className="text-right">{location.expectedToWork} expected / {location.totalStaff} total</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
