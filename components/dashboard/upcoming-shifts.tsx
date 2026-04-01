'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const shifts = [
  {
    id: 1,
    employee: 'Michael Chen',
    initials: 'MC',
    location: 'Main Gate - Building A',
    time: '06:00 - 14:00',
    type: 'Day Shift',
  },
  {
    id: 2,
    employee: 'Sarah Williams',
    initials: 'SW',
    location: 'Parking Lot B',
    time: '14:00 - 22:00',
    type: 'Evening',
  },
  {
    id: 3,
    employee: 'David Rodriguez',
    initials: 'DR',
    location: 'VIP Section',
    time: '22:00 - 06:00',
    type: 'Night Shift',
  },
  {
    id: 4,
    employee: 'Emily Johnson',
    initials: 'EJ',
    location: 'Reception Area',
    time: '08:00 - 16:00',
    type: 'Day Shift',
  },
  {
    id: 5,
    employee: 'James Wilson',
    initials: 'JW',
    location: 'Warehouse',
    time: '16:00 - 00:00',
    type: 'Evening',
  },
]

export function UpcomingShifts() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Upcoming Shifts</CardTitle>
        <CardDescription>Today&apos;s scheduled assignments</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 p-6 pt-0">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={`/avatars/${shift.id}.jpg`} alt={shift.employee} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {shift.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{shift.employee}</p>
                  <p className="text-xs text-muted-foreground truncate">{shift.location}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
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
