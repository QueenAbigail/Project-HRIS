'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserPlus, Clock, FileText, AlertTriangle, CheckCircle } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'check-in',
    message: 'Michael Chen clocked in at Main Gate',
    time: '2 min ago',
    icon: Clock,
  },
  {
    id: 2,
    type: 'new-employee',
    message: 'New employee Jason Park added',
    time: '15 min ago',
    icon: UserPlus,
  },
  {
    id: 3,
    type: 'leave-approved',
    message: 'Leave approved for Sarah Williams',
    time: '1 hour ago',
    icon: CheckCircle,
  },
  {
    id: 4,
    type: 'alert',
    message: 'Late arrival: David Rodriguez',
    time: '2 hours ago',
    icon: AlertTriangle,
  },
  {
    id: 5,
    type: 'report',
    message: 'Monthly payroll report generated',
    time: '3 hours ago',
    icon: FileText,
  },
  {
    id: 6,
    type: 'check-in',
    message: 'Emily Johnson completed shift',
    time: '4 hours ago',
    icon: Clock,
  },
]

const iconColors: Record<string, string> = {
  'check-in': 'text-primary',
  'new-employee': 'text-success',
  'leave-approved': 'text-success',
  'alert': 'text-warning',
  'report': 'text-chart-2',
}

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system events</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 p-6 pt-0">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 ${iconColors[activity.type]}`}>
                  <activity.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
