'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const attendanceRecords = [
  {
    id: 1,
    employee: 'Michael Chen',
    initials: 'MC',
    department: 'Field Security',
    checkIn: '06:02 AM',
    checkOut: '02:05 PM',
    status: 'present',
    hours: '8h 03m',
  },
  {
    id: 2,
    employee: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    checkIn: '05:58 AM',
    checkOut: '02:00 PM',
    status: 'present',
    hours: '8h 02m',
  },
  {
    id: 3,
    employee: 'David Rodriguez',
    initials: 'DR',
    department: 'Patrol',
    checkIn: '06:45 AM',
    checkOut: '--:--',
    status: 'late',
    hours: '7h 15m',
  },
  {
    id: 4,
    employee: 'Emily Johnson',
    initials: 'EJ',
    department: 'Administration',
    checkIn: '08:00 AM',
    checkOut: '04:30 PM',
    status: 'present',
    hours: '8h 30m',
  },
  {
    id: 5,
    employee: 'James Wilson',
    initials: 'JW',
    department: 'Field Security',
    checkIn: '--:--',
    checkOut: '--:--',
    status: 'absent',
    hours: '--',
  },
  {
    id: 6,
    employee: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    checkIn: '--:--',
    checkOut: '--:--',
    status: 'leave',
    hours: '--',
  },
  {
    id: 7,
    employee: 'Jessica Brown',
    initials: 'JB',
    department: 'Surveillance',
    checkIn: '06:00 AM',
    checkOut: '02:15 PM',
    status: 'present',
    hours: '8h 15m',
  },
  {
    id: 8,
    employee: 'Thomas Anderson',
    initials: 'TA',
    department: 'Field Security',
    checkIn: '05:55 AM',
    checkOut: '02:00 PM',
    status: 'present',
    hours: '8h 05m',
  },
]

const statusStyles: Record<string, string> = {
  'present': 'bg-success/10 text-success border-success/20',
  'late': 'bg-warning/10 text-warning border-warning/20',
  'absent': 'bg-destructive/10 text-destructive border-destructive/20',
  'leave': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
}

const statusLabels: Record<string, string> = {
  'present': 'Present',
  'late': 'Late',
  'absent': 'Absent',
  'leave': 'On Leave',
}

export function AttendanceTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Today&apos;s Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead className="hidden sm:table-cell">Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={`/avatars/${record.id}.jpg`} alt={record.employee} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {record.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{record.employee}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {record.department}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {record.checkIn}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {record.checkOut}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {record.hours}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[record.status]}>
                      {statusLabels[record.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
