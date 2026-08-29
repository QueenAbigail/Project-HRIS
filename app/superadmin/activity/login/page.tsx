'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { ArrowLeft, LogIn, RefreshCw, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { LoginActivityRecord } from '@/lib/auth-activity'

const reasonFor = (result: string) => result === 'SUCCESS' ? 'Success' : result === 'FAILED_INVALID_CREDENTIALS' ? 'Invalid credentials — incorrect password or account not found' : result === 'FAILED_DEVICE_LIMIT' ? 'Device is already assigned to another account' : 'Authentication failed'
const shortReasonFor = (result: string) => result === 'SUCCESS' ? 'Success' : result === 'FAILED_INVALID_CREDENTIALS' ? 'Invalid credentials' : result === 'FAILED_DEVICE_LIMIT' ? 'Device limit' : 'Authentication failed'

function ActivityRow({ activity }: { activity: LoginActivityRecord }) {
  const [date, time] = activity.timestamp.split(' ')
  return <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
    <div className="min-w-0"><div className="flex min-w-0 items-center gap-1.5"><p className="truncate font-medium">{activity.employeeName}</p><span className="shrink-0 text-xs text-muted-foreground">· {activity.employeeId}</span>{activity.isDummy && <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">(demo)</span>}</div><div className="mt-2 flex flex-wrap gap-1.5"><Badge variant="outline" className="text-[11px]">{date}</Badge><Badge variant="outline" className="text-[11px]">{time}</Badge></div></div>
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="font-medium text-foreground">{activity.channel}</button></TooltipTrigger><TooltipContent><p>IP address: {activity.ipAddress}</p><p className="mt-1 max-w-md break-all">Device: {activity.device}</p></TooltipContent></Tooltip><span aria-hidden="true">·</span><Tooltip><TooltipTrigger asChild><button type="button" className={activity.result === 'SUCCESS' ? 'font-medium text-foreground' : 'font-medium text-destructive'}>{shortReasonFor(activity.result)}</button></TooltipTrigger><TooltipContent><p>Reason: {reasonFor(activity.result)}</p></TooltipContent></Tooltip></TooltipProvider></div>
  </div>
}

export default function LoginActivityPage() {
  const fetcher = async (url: string) => { const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw new Error('Unable to load activity'); return (await response.json()).activities as LoginActivityRecord[] }
  const { data: activities = [], mutate, isLoading } = useSWR<LoginActivityRecord[]>('/api/superadmin/login-activity?limit=100', fetcher, { revalidateOnFocus: false })
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState('ALL')
  const [result, setResult] = useState('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const filtered = useMemo(() => activities.filter((activity) => { const query = search.toLowerCase(); return (!query || [activity.employeeName, activity.employeeId, activity.email, activity.ipAddress, activity.device, reasonFor(activity.result)].some((value) => value.toLowerCase().includes(query))) && (channel === 'ALL' || activity.channel === channel) && (result === 'ALL' || activity.result === result) }), [activities, channel, result, search])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  return <main className="flex flex-col gap-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon" aria-label="Back to dashboard"><Link href="/superadmin"><ArrowLeft /></Link></Button><div><div className="flex items-center gap-2"><LogIn className="size-5 text-primary" /><h1 className="text-3xl font-bold tracking-tight">User Login Activity</h1></div><p className="text-muted-foreground">Real login records from the database, with demo records for comparison</p></div></div><Button type="button" variant="outline" onClick={() => void mutate()} disabled={isLoading}><RefreshCw className={isLoading ? 'mr-2 size-4 animate-spin' : 'mr-2 size-4'} />Refresh</Button></div><Card><CardHeader><CardTitle>Login records</CardTitle><CardDescription>Showing {visible.length} of {filtered.length} matching records</CardDescription><div className="flex flex-col gap-2 pt-2 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search employee name, ID, email, IP, device, or reason" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={channel} onChange={(event) => { setChannel(event.target.value); setPage(1) }} aria-label="Filter by channel"><option value="ALL">All channels</option><option value="WEB">Web</option><option value="MOBILE">Mobile</option></select><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={result} onChange={(event) => { setResult(event.target.value); setPage(1) }} aria-label="Filter by result"><option value="ALL">All results</option><option value="SUCCESS">Success</option><option value="FAILED_INVALID_CREDENTIALS">Invalid credentials</option><option value="FAILED_DEVICE_LIMIT">Device limit</option><option value="FAILED_OTHER">Other failures</option></select></div></CardHeader><CardContent className="flex flex-col gap-3">{isLoading ? <p className="py-8 text-center text-muted-foreground">Loading login records...</p> : visible.length ? visible.map((activity) => <ActivityRow key={activity.id} activity={activity} />) : <p className="py-8 text-center text-muted-foreground">No login records found.</p>}<div className="flex items-center justify-center gap-4 pt-3"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span><Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</Button></div></CardContent></Card></main>
}
