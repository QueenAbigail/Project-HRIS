'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, AlertTriangle, MapPin } from 'lucide-react'
import { getLateCheckIns, getLateCheckInSeverity, formatTime } from '@/lib/data'

const severityStyles = {
  minor: 'bg-warning/10 text-warning border-warning/20',
  moderate: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  severe: 'bg-destructive/10 text-destructive border-destructive/20',
}

const severityLabels = {
  minor: 'Minor',
  moderate: 'Moderate', 
  severe: 'Severe',
}

export function LateCheckIns() {
  const lateCheckIns = getLateCheckIns()

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              Late Check-Ins
            </CardTitle>
            <CardDescription>
              Employees who checked in after scheduled time
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {lateCheckIns.length} today
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px]">
          <div className="space-y-4 p-6 pt-0">
            {lateCheckIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="size-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No late check-ins today</p>
                <p className="text-sm text-muted-foreground">All employees arrived on time</p>
              </div>
            ) : (
              lateCheckIns.map((record) => {
                const severity = getLateCheckInSeverity(record.lateMinutes)
                return (
                  <div 
                    key={record.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
                  >
                    <Avatar className="size-10">
                      <AvatarImage src={`/avatars/${record.employeeId}.jpg`} alt={record.employeeName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {record.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{record.employeeName}</p>
                        <Badge variant="outline" className={severityStyles[severity]}>
                          {severityLabels[severity]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        <span className="truncate">{record.locationName}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">
                            Scheduled: <span className="font-mono text-foreground">{formatTime(record.scheduledStart)}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Actual: <span className="font-mono text-warning">{formatTime(record.actualCheckIn)}</span>
                          </span>
                        </div>
                        <span className="text-xs font-medium text-destructive">
                          +{record.lateMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
