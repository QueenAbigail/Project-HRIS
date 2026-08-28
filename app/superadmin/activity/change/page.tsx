'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, UserPlus, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

const changeActivities = [
  { id: '1', type: 'user added', actor: 'Super Admin', subject: "Ahmad Rif'an", timestamp: '2025-05-07 14:15:30', description: 'New user added to HR Department' },
  { id: '3', type: 'user edited', actor: 'Admin User', subject: 'Budi Santoso', timestamp: '2025-05-07 12:45:15', description: 'Position changed from Staff to Senior Staff' },
  { id: '4', type: 'permission changed', actor: 'Super Admin', subject: 'Finance Team', timestamp: '2025-05-07 11:20:00', description: 'Added report access permission' },
  { id: '6', type: 'user added', actor: 'Super Admin', subject: 'Siti Nurhaliza', timestamp: '2025-05-06 16:30:00', description: 'New user added to Marketing Department' },
  { id: '7', type: 'user edited', actor: 'Admin User', subject: 'Rinto Harahap', timestamp: '2025-05-06 15:15:00', description: 'Department changed from Operations to Finance' },
]

export default function ChangeActivityPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const filtered = useMemo(() => changeActivities.filter((activity) => { const query = search.toLowerCase(); return !query || [activity.type, activity.actor, activity.subject, activity.description].some((value) => value.toLowerCase().includes(query)) }), [search])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  return <main className="flex flex-col gap-6"><div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon" aria-label="Back to dashboard"><Link href="/superadmin"><ArrowLeft data-icon="inline-start" /></Link></Button><div><div className="flex items-center gap-2"><UserPlus className="size-5 text-primary" /><h1 className="text-3xl font-bold tracking-tight">Change Activity</h1></div><p className="text-muted-foreground">All recent user and permission changes</p></div></div><Card><CardHeader><CardTitle>User changes</CardTitle><CardDescription>Showing {visible.length} of {filtered.length} records</CardDescription><div className="relative max-w-md pt-2"><Search className="absolute left-3 top-1/2 mt-1 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search user, actor, or change" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></div></CardHeader><CardContent className="flex flex-col gap-3">{visible.map((activity) => <div key={activity.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{activity.subject}</p><p className="text-sm text-muted-foreground">{activity.description}</p><p className="text-sm text-muted-foreground">{activity.actor} · {activity.timestamp}</p></div><Badge variant="outline">{activity.type}</Badge></div>)}{visible.length === 0 && <p className="py-8 text-center text-muted-foreground">No change activity found.</p>}<Pagination className="pt-3"><PaginationContent><PaginationItem><PaginationPrevious href={page > 1 ? `?page=${page - 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page > 1) setPage(page - 1) }} /></PaginationItem><PaginationItem><span className="px-3 text-sm text-muted-foreground">Page {page} of {pageCount}</span></PaginationItem><PaginationItem><PaginationNext href={page < pageCount ? `?page=${page + 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page < pageCount) setPage(page + 1) }} /></PaginationItem></PaginationContent></Pagination></CardContent></Card></main>
}
