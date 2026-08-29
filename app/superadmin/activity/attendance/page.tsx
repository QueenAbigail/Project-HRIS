'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, RefreshCw, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import type { AttendanceActivityRecord } from '@/lib/auth-activity'

const labelFor = (result: string) => result.replace('FAILED_', '').replaceAll('_', ' ')

export default function AttendanceActivityPage() {
  const fetcher = async (url: string) => { const response = await fetch(url, { cache: 'no-store' }); if (!response.ok) throw new Error('Unable to load attendance activity'); return (await response.json()).activities as AttendanceActivityRecord[] }
  const { data: activities = [], mutate, isLoading } = useSWR<AttendanceActivityRecord[]>('/api/superadmin/attendance-activity?limit=100', fetcher, { revalidateOnFocus: false })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const filtered = useMemo(() => activities.filter((activity) => { const query = search.toLowerCase(); return !query || [activity.employeeName, activity.employeeId, activity.email, activity.result, activity.action, activity.device].some((value) => value.toLowerCase().includes(query)) }), [activities, search])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  return <main className="flex flex-col gap-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon" aria-label="Back to dashboard"><Link href="/superadmin"><ArrowLeft /></Link></Button><div><div className="flex items-center gap-2"><AlertTriangle className="size-5 text-destructive" /><h1 className="text-3xl font-bold tracking-tight">User Attendance</h1></div><p className="text-muted-foreground">GPS and attendance-location failures from the database</p></div></div><Button type="button" variant="outline" onClick={() => void mutate()} disabled={isLoading}><RefreshCw className={isLoading ? 'mr-2 size-4 animate-spin' : 'mr-2 size-4'} />Refresh</Button></div><Card><CardHeader><CardTitle>Attendance failures</CardTitle><CardDescription>Showing {visible.length} of {filtered.length} matching records</CardDescription><div className="relative max-w-md pt-2"><Search className="absolute left-3 top-1/2 mt-1 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search employee, email, device, or failure" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div></CardHeader><CardContent className="flex flex-col gap-3">{visible.map((activity) => <div key={activity.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{activity.employeeName} <span className="text-sm text-muted-foreground">· {activity.employeeId}</span></p><p className="text-sm text-destructive">{labelFor(activity.result)} · {activity.action.replace('ATTENDANCE_', '')}</p><p className="text-sm text-muted-foreground">{activity.timestamp} · {activity.distance === null ? 'Distance unavailable' : `${Math.round(activity.distance)} m from point`}</p></div><Badge variant="destructive">Attendance failure</Badge></div>)}{visible.length === 0 && <p className="py-8 text-center text-muted-foreground">No attendance failures found.</p>}<Pagination className="pt-3"><PaginationContent><PaginationItem><PaginationPrevious href={page > 1 ? `?page=${page - 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page > 1) setPage(page - 1) }} /></PaginationItem><PaginationItem><span className="px-3 text-sm text-muted-foreground">Page {page} of {pageCount}</span></PaginationItem><PaginationItem><PaginationNext href={page < pageCount ? `?page=${page + 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page < pageCount) setPage(page + 1) }} /></PaginationItem></PaginationContent></Pagination></CardContent></Card></main>
}
