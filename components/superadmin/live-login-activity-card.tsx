'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'
import { LogIn, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { LoginActivityRecord } from '@/lib/auth-activity'

const reasonFor = (result: string) => result === 'SUCCESS' ? 'Success' : result === 'FAILED_INVALID_CREDENTIALS' ? 'Invalid credentials — incorrect password or account not found' : result === 'FAILED_DEVICE_LIMIT' ? 'Device is already assigned to another account' : 'Authentication failed'
const shortReasonFor = (result: string) => result === 'SUCCESS' ? 'Success' : result === 'FAILED_INVALID_CREDENTIALS' ? 'Invalid credentials' : result === 'FAILED_DEVICE_LIMIT' ? 'Device limit' : 'Authentication failed'
export function LiveLoginActivityCard({ initialActivities }: { initialActivities: LoginActivityRecord[] }) {
  const [activities, setActivities] = useState(initialActivities)
  const [refreshing, setRefreshing] = useState(false)
  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/superadmin/login-activity', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unable to refresh login activity')
      setActivities((await response.json()).activities)
    } finally {
      setRefreshing(false)
    }
  }, [])
  return <Card className="flex h-full min-h-[500px] flex-col border border-border bg-card">
    <CardHeader className="border-b border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2"><LogIn className="size-5 shrink-0 text-primary" /><div className="min-w-0"><CardTitle>User Login Activity</CardTitle><CardDescription>Latest 20 login records</CardDescription></div></div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={refresh} disabled={refreshing} aria-label="Refresh login activity"><RefreshCw className={refreshing ? 'size-4 animate-spin' : 'size-4'} /></Button>
          <Button asChild variant="outline" size="sm"><Link href="/superadmin/activity/login">View all</Link></Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-1 pt-6"><ScrollArea className="h-full pr-4"><div className="space-y-3">
      {activities.map((activity) => { const [date, time] = activity.timestamp.split(' '); return <div key={activity.id} className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-medium">{activity.employeeName}</p><Badge variant="outline" className="shrink-0 text-[10px]">{activity.employeeId}</Badge>{activity.isDummy && <Badge variant="outline" className="text-[10px]">DEMO</Badge>}</div><p className="truncate text-xs text-muted-foreground">{activity.email}</p><div className="mt-1 flex flex-wrap gap-1"><Badge variant="outline" className="text-[11px]">{date}</Badge><Badge variant="outline" className="text-[11px]">{time}</Badge></div></div><Badge variant={activity.result === 'SUCCESS' ? 'secondary' : 'destructive'} className="shrink-0 text-[11px]">{activity.result === 'SUCCESS' ? 'SUCCESS' : 'FAILED'}</Badge></div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5"><TooltipProvider><Tooltip><TooltipTrigger asChild><Badge variant="outline" className="cursor-help text-[11px]">{activity.channel}</Badge></TooltipTrigger><TooltipContent><p>IP address: {activity.ipAddress}</p><p className="mt-1 max-w-sm break-all">Device: {activity.device}</p></TooltipContent></Tooltip><Tooltip><TooltipTrigger asChild><Badge variant={activity.result === 'SUCCESS' ? 'secondary' : 'destructive'} className="max-w-[130px] cursor-help truncate text-[11px]">{shortReasonFor(activity.result)}</Badge></TooltipTrigger><TooltipContent><p className="max-w-sm">Reason: {reasonFor(activity.result)}</p></TooltipContent></Tooltip></TooltipProvider></div>
      </div> })}
    </div></ScrollArea></CardContent>
  </Card>
}
