'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Clock, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { getLateCheckIns } from '@/lib/data'

export function RecentActivity() {
  const lateCheckIns = getLateCheckIns()
  
  // Generate activities from real late check-in data
  const lateActivities = lateCheckIns.slice(0, 3).map((record, index) => ({
    id: `late-${record.id}`,
    type: 'late-checkin',
    message: `Late arrival: ${record.employeeName}`,
    detail: `+${record.lateMinutes} min at ${record.locationName}`,
    time: `${(index + 1) * 15} min ago`,
    icon: AlertTriangle,
    lateMinutes: record.lateMinutes,
  }))

  const otherActivities = [
    {
      id: '1',
      type: 'check-in',
      message: 'Michael Chen clocked in at Main Gate',
      time: '2 min ago',
      icon: Clock,
    },
    {
      id: '2',
      type: 'new-employee',
      message: 'New employee Jason Park added',
      time: '1 hour ago',
      icon: UserPlus,
    },
    {
      id: '3',
      type: 'leave-approved',
      message: 'Leave approved for Sarah Williams',
      time: '2 hours ago',
      icon: CheckCircle,
    },
    {
      id: '4',
      type: 'report',
      message: 'Late check-in report auto-generated',
      time: '3 hours ago',
      icon: FileText,
    },
  ]

  // Combine and sort activities (late arrivals are more recent)
  const activities = [...lateActivities, ...otherActivities].slice(0, 8)

  const iconColors: Record<string, string> = {
    'check-in': 'text-primary',
    'new-employee': 'text-success',
    'leave-approved': 'text-success',
    'late-checkin': 'text-warning',
    'report': 'text-chart-2',
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </div>
          {lateCheckIns.length > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
              {lateCheckIns.length} late today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 p-6 pt-0">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 ${
                  activity.type === 'late-checkin' ? 'bg-warning/5 -mx-2 px-2 py-2 rounded-lg' : ''
                }`}
              >
                <div className={`mt-0.5 ${iconColors[activity.type]}`}>
                  <activity.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  {'detail' in activity && (
                    <p className="text-xs text-warning">{activity.detail}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.type === 'late-checkin' && 'lateMinutes' in activity && (
                  <Badge 
                    variant="outline" 
                    className={
                      activity.lateMinutes <= 15 
                        ? 'bg-warning/10 text-warning border-warning/20 text-xs' 
                        : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'
                    }
                  >
                    +{activity.lateMinutes}m
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
