'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Clock, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { EmptyState } from './EmptyState'
// no import needed

interface RecentActivityProps {
  activities: Array<any>
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState 
            icon={<Clock className="size-12 text-muted-foreground" />}
            title="Belum ada aktivitas"
            description="Aktivitas akan muncul di sini"
          />
        </CardContent>
      </Card>
    );
  }

  const iconColors: Record<string, string> = {
    'check-in': 'text-primary',
    'new-employee': 'text-success',
    'leave-approved': 'text-success',
    'late-checkin': 'text-warning',
    'leave-request': 'text-primary',
    'report': 'text-chart-2',
  };

  const iconMap: Record<string, React.ComponentType<any>> = {
    AlertTriangle: AlertTriangle,
    Clock: Clock,
    UserPlus: UserPlus,
    CheckCircle: CheckCircle,
    FileText: FileText,
  };

  const lateCheckInsCount = activities.filter((a: any) => a.type === 'late-checkin').length;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </div>
          {lateCheckInsCount > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
              {lateCheckInsCount} late today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-4 p-6 pt-0">
            {activities.map((activity) => {
              const Icon = iconMap[activity.icon as keyof typeof iconMap] || Clock;
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-start gap-3 ${
                    activity.type === 'late-checkin' ? 'bg-warning/5 -mx-2 px-2 py-2 rounded-lg' : ''
                  }`}
                >
                  <div className={`mt-0.5 ${iconColors[activity.type]}`}>
                    <Icon className="size-4" />
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
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
