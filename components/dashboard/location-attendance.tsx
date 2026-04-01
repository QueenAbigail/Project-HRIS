'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, Users, UserCheck, UserX, Clock } from 'lucide-react'

const locationData = [
  {
    id: 'HO',
    name: 'Head Office',
    totalStaff: 35,
    present: 32,
    absent: 2,
    notCheckedIn: 1,
    onLeave: 0,
  },
  {
    id: 'PT-DT',
    name: 'Plaza Tower - Downtown',
    totalStaff: 48,
    present: 42,
    absent: 3,
    notCheckedIn: 2,
    onLeave: 1,
  },
  {
    id: 'RM',
    name: 'Riverside Mall',
    totalStaff: 52,
    present: 45,
    absent: 4,
    notCheckedIn: 3,
    onLeave: 0,
  },
  {
    id: 'MB-CT',
    name: 'Metro Bank - Central',
    totalStaff: 28,
    present: 24,
    absent: 1,
    notCheckedIn: 2,
    onLeave: 1,
  },
  {
    id: 'CC-N',
    name: 'Corporate Center - North',
    totalStaff: 44,
    present: 38,
    absent: 3,
    notCheckedIn: 2,
    onLeave: 1,
  },
  {
    id: 'IP-W',
    name: 'Industrial Park - West',
    totalStaff: 40,
    present: 35,
    absent: 2,
    notCheckedIn: 3,
    onLeave: 0,
  },
]

export function LocationAttendance() {
  const totals = locationData.reduce(
    (acc, loc) => ({
      totalStaff: acc.totalStaff + loc.totalStaff,
      present: acc.present + loc.present,
      absent: acc.absent + loc.absent,
      notCheckedIn: acc.notCheckedIn + loc.notCheckedIn,
      onLeave: acc.onLeave + loc.onLeave,
    }),
    { totalStaff: 0, present: 0, absent: 0, notCheckedIn: 0, onLeave: 0 }
  )

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
              <div className="size-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Not Checked In</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
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
            <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <UserX className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{totals.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="size-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{totals.notCheckedIn}</p>
              <p className="text-xs text-muted-foreground">Not Checked In</p>
            </div>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="space-y-3">
          {locationData.map((location) => {
            const attendanceRate = Math.round((location.present / location.totalStaff) * 100)
            return (
              <div
                key={location.id}
                className="p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-muted flex items-center justify-center">
                      <MapPin className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{location.id}</p>
                    </div>
                  </div>
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
                <div className="space-y-2">
                  <Progress value={attendanceRate} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <UserCheck className="size-3 text-success" />
                        {location.present} present
                      </span>
                      <span className="flex items-center gap-1">
                        <UserX className="size-3 text-destructive" />
                        {location.absent} absent
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 text-warning" />
                        {location.notCheckedIn} not checked in
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
