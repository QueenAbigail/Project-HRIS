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
import { Button } from '@/components/ui/button'
import { Check, X, Eye } from 'lucide-react'

const leaveRequests = [
  {
    id: 1,
    employee: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    location: 'Downtown Site',
    type: 'Annual Leave',
    startDate: 'Apr 1, 2026',
    endDate: 'Apr 5, 2026',
    days: 5,
    reason: 'Family vacation',
    status: 'pending',
  },
  {
    id: 2,
    employee: 'Jessica Brown',
    initials: 'JB',
    department: 'Surveillance',
    location: 'North Campus',
    type: 'Sick Leave',
    startDate: 'Mar 31, 2026',
    endDate: 'Mar 31, 2026',
    days: 1,
    reason: 'Medical appointment',
    status: 'pending',
  },
  {
    id: 3,
    employee: 'Thomas Anderson',
    initials: 'TA',
    department: 'Field Security',
    location: 'West Avenue',
    type: 'Personal',
    startDate: 'Apr 3, 2026',
    endDate: 'Apr 3, 2026',
    days: 1,
    reason: 'Personal matters',
    status: 'pending',
  },
  {
    id: 4,
    employee: 'Amanda Martinez',
    initials: 'AM',
    department: 'Administration',
    location: 'Headquarters',
    type: 'Annual Leave',
    startDate: 'Apr 7, 2026',
    endDate: 'Apr 10, 2026',
    days: 4,
    reason: 'Wedding ceremony',
    status: 'approved',
  },
  {
    id: 5,
    employee: 'Michael Chen',
    initials: 'MC',
    department: 'Field Security',
    location: 'East Terminal',
    type: 'Emergency',
    startDate: 'Mar 28, 2026',
    endDate: 'Mar 29, 2026',
    days: 2,
    reason: 'Family emergency',
    status: 'approved',
  },
  {
    id: 6,
    employee: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    location: 'Central Hub',
    type: 'Annual Leave',
    startDate: 'Apr 15, 2026',
    endDate: 'Apr 20, 2026',
    days: 6,
    reason: 'Extended holiday',
    status: 'rejected',
  },
]

const statusStyles: Record<string, string> = {
  'pending': 'bg-warning/10 text-warning border-warning/20',
  'approved': 'bg-success/10 text-success border-success/20',
  'rejected': 'bg-destructive/10 text-destructive border-destructive/20',
}

const typeStyles: Record<string, string> = {
  'Annual Leave': 'bg-primary/10 text-primary border-primary/20',
  'Sick Leave': 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  'Personal': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Emergency': 'bg-destructive/10 text-destructive border-destructive/20',
}

export function LeaveRequestsTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Period</TableHead>
                <TableHead className="hidden sm:table-cell">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={`/avatars/${request.id}.jpg`} alt={request.employee} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {request.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.employee}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{request.department}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {request.location}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeStyles[request.type]}>
                      {request.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {request.startDate} - {request.endDate}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {request.days}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[request.status]}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' ? (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="size-7 text-success hover:text-success hover:bg-success/10">
                          <Check className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" className="size-7">
                        <Eye className="size-4" />
                      </Button>
                    )}
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
