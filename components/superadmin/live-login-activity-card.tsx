import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getLoginActivity } from '@/lib/auth-activity'

export async function LiveLoginActivityCard() {
  const activities = await getLoginActivity(20)

  return <Card className="border border-border bg-card flex flex-col h-full min-h-[500px]">
    <CardHeader className="border-b border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><LogIn className="size-5 text-primary" /><div><CardTitle>User Login Activity</CardTitle><CardDescription>Latest login records</CardDescription></div></div>
        <Button asChild variant="outline" size="sm"><Link href="/superadmin/activity/login">View all</Link></Button>
      </div>
    </CardHeader>
    <CardContent className="flex-1 pt-6"><ScrollArea className="h-full pr-4"><div className="space-y-3">
      {activities.map((activity) => <div key={activity.id} className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-start justify-between gap-2 mb-2"><div className="min-w-0"><p className="font-medium text-sm truncate">{activity.email}{activity.isDummy ? ' (demo)' : ''}</p><p className="text-xs text-muted-foreground">{activity.timestamp}</p></div><Badge variant={activity.result === 'SUCCESS' ? 'secondary' : 'destructive'}>{activity.result.replaceAll('_', ' ')}</Badge></div>
        <div className="flex flex-wrap gap-2"><Badge variant="outline">{activity.channel}</Badge><Badge variant="outline">{activity.ipAddress}</Badge><Badge variant="secondary">{activity.device}</Badge></div>
      </div>)}
    </div></ScrollArea></CardContent>
  </Card>
}
