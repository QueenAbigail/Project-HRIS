'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, Users, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react'
import { getLocationAttendanceStats, getOverallAttendanceStats } from '@/lib/data'

export function LocationAttendance() {
  const locationData = getLocationAttendanceStats()
  const overallStats = getOverallAttendanceStats()

  const totals = {
    totalStaff: locationData.reduce((acc, loc) => acc + loc.totalStaff, 0),
    present: locationData.reduce((acc, loc) => acc + loc.present + loc.late, 0),
    absent: locationData.reduce((acc, loc) => acc + loc.absent, 0),
    late: locationData.reduce((acc, loc) => acc + loc.late, 0),
    notCheckedIn: locationData.reduce((acc, loc) => acc + loc.notCheckedIn, 0),
    onLeave: locationData.reduce((acc, loc) => acc + loc.onLeave, 0),
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Attendance by Location
            </CardTitle>
            <CardDescription>Real-time status across all client sites</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
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
        </div>

        {/* Avg Late Minutes Alert */}
        {overallStats.lateCheckIns > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="size-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {overallStats.lateCheckIns} late check-ins today
              </p>
              <p className="text-xs text-muted-foreground">
                Average delay: {overallStats.averageLateMinutes} minutes | Total late time: {overallStats.totalLateMinutes} minutes
              </p>
            </div>
          </div>
        )}

        {/* Location Breakdown */}
        <div className="space-y-3">
          {locationData.map((location) => {
            const attendanceRate = location.attendanceRate
            const hasLateCheckIns = location.late > 0
            return (
              <div
                key={location.locationId}
                className={`p-4 rounded-lg border bg-secondary/20 hover:bg-secondary/30 transition-colors ${
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
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
                    </div>
                    <span>{location.totalStaff} total</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
