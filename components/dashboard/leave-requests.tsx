'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X } from 'lucide-react'

const leaveRequests = [
  {
    id: 1,
    employee: 'Robert Taylor',
    initials: 'RT',
    type: 'Annual Leave',
    dates: 'Apr 1-5, 2026',
    status: 'pending',
  },
  {
    id: 2,
    employee: 'Jessica Brown',
    initials: 'JB',
    type: 'Sick Leave',
    dates: 'Mar 31, 2026',
    status: 'pending',
  },
  {
    id: 3,
    employee: 'Thomas Anderson',
    initials: 'TA',
    type: 'Personal',
    dates: 'Apr 3, 2026',
    status: 'pending',
  },
  {
    id: 4,
    employee: 'Amanda Martinez',
    initials: 'AM',
    type: 'Annual Leave',
    dates: 'Apr 7-10, 2026',
    status: 'pending',
  },
]

export function LeaveRequests() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
        <CardDescription>Pending approval requests</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 p-6 pt-0">
            {leaveRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={`/avatars/${request.id}.jpg`} alt={request.employee} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {request.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{request.employee}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {request.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{request.dates}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="size-7 text-success hover:text-success hover:bg-success/10">
                    <Check className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
