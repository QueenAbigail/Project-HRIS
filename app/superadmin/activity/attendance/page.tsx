'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

const attendanceActivities = [
  { id: '2', subject: 'Attendance Check-in Failed', actor: 'System', timestamp: '2025-05-07 13:30:00', description: '5 employees failed to check in today' },
  { id: '5', subject: 'Overtime Record Error', actor: 'System', timestamp: '2025-05-07 10:00:00', description: 'Invalid overtime entries detected' },
]

export default function AttendanceActivityPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const filtered = useMemo(() => attendanceActivities.filter((activity) => {
    const query = search.toLowerCase()
    return !query || [activity.subject, activity.actor, activity.description, activity.timestamp].some((value) => value.toLowerCase().includes(query))
  }), [search])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard"><Link href="/superadmin"><ArrowLeft data-icon="inline-start" /></Link></Button>
        <div><div className="flex items-center gap-2"><AlertTriangle className="size-5 text-destructive" /><h1 className="text-3xl font-bold tracking-tight">User Attendance</h1></div><p className="text-muted-foreground">All recent attendance errors and system events</p></div>
      </div>
      <Card><CardHeader><CardTitle>Attendance errors</CardTitle><CardDescription>Showing {visible.length} of {filtered.length} records</CardDescription><div className="relative max-w-md pt-2"><Search className="absolute left-3 top-1/2 mt-1 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search attendance errors" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div></CardHeader><CardContent className="flex flex-col gap-3">{visible.map((activity) => <div key={activity.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{activity.subject}</p><p className="text-sm text-muted-foreground">{activity.description}</p><p className="text-sm text-muted-foreground">{activity.actor} · {activity.timestamp}</p></div><Badge variant="destructive">Attendance error</Badge></div>)}{visible.length === 0 && <p className="py-8 text-center text-muted-foreground">No attendance errors found.</p>}<Pagination className="pt-3"><PaginationContent><PaginationItem><PaginationPrevious href={page > 1 ? `?page=${page - 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page > 1) setPage(page - 1) }} /></PaginationItem><PaginationItem><span className="px-3 text-sm text-muted-foreground">Page {page} of {pageCount}</span></PaginationItem><PaginationItem><PaginationNext href={page < pageCount ? `?page=${page + 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page < pageCount) setPage(page + 1) }} /></PaginationItem></PaginationContent></Pagination></CardContent></Card>
    </main>
  )
}
