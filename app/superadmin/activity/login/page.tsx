'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, LogIn, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

interface LoginActivity {
  id: string
  email: string
  timestamp: string
  ipAddress: string
  device: string
}

const loginActivities: LoginActivity[] = [
  { id: '1', email: 'john.doe@example.com', timestamp: '2025-05-07 14:32:15', ipAddress: '192.168.1.100', device: 'Chrome - Windows' },
  { id: '2', email: 'jane.smith@example.com', timestamp: '2025-05-07 13:45:22', ipAddress: '192.168.1.101', device: 'Safari - macOS' },
  { id: '3', email: 'admin@example.com', timestamp: '2025-05-07 12:15:00', ipAddress: '192.168.1.102', device: 'Firefox - Ubuntu' },
  { id: '4', email: 'hr.manager@example.com', timestamp: '2025-05-07 10:30:45', ipAddress: '192.168.1.103', device: 'Chrome - Windows' },
  { id: '5', email: 'finance.team@example.com', timestamp: '2025-05-07 09:12:30', ipAddress: '192.168.1.104', device: 'Safari - iOS' },
  { id: '6', email: 'support@example.com', timestamp: '2025-05-06 16:45:20', ipAddress: '192.168.1.105', device: 'Chrome - Android' },
  { id: '7', email: 'ops@example.com', timestamp: '2025-05-06 15:20:10', ipAddress: '192.168.1.106', device: 'Edge - Windows' },
  { id: '8', email: 'marketing@example.com', timestamp: '2025-05-06 14:05:00', ipAddress: '192.168.1.107', device: 'Firefox - macOS' },
]

export default function LoginActivityPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const filteredActivities = useMemo(() => loginActivities.filter((activity) => {
    const query = search.toLowerCase()
    return !query || [activity.email, activity.ipAddress, activity.device].some((value) => value.toLowerCase().includes(query))
  }), [search])
  const pageCount = Math.max(1, Math.ceil(filteredActivities.length / pageSize))
  const visibleActivities = filteredActivities.slice((page - 1) * pageSize, page * pageSize)

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard">
            <Link href="/superadmin"><ArrowLeft data-icon="inline-start" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2"><LogIn className="size-5 text-primary" /><h1 className="text-3xl font-bold tracking-tight">User Login Activity</h1></div>
            <p className="text-muted-foreground">All recent login records from system users</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Login records</CardTitle>
          <CardDescription>Showing {visibleActivities.length} of {filteredActivities.length} records</CardDescription>
          <div className="relative max-w-md pt-2">
            <Search className="absolute left-3 top-1/2 mt-1 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search email, IP, or device" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {visibleActivities.map((activity) => (
            <div key={activity.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="truncate font-medium">{activity.email}</p><p className="text-sm text-muted-foreground">{activity.timestamp}</p></div>
              <div className="flex flex-wrap gap-2"><Badge variant="outline">{activity.ipAddress}</Badge><Badge variant="secondary">{activity.device}</Badge></div>
            </div>
          ))}
          {visibleActivities.length === 0 && <p className="py-8 text-center text-muted-foreground">No login records found.</p>}
          <Pagination className="pt-3">
            <PaginationContent>
              <PaginationItem><PaginationPrevious href={page > 1 ? `?page=${page - 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page > 1) setPage(page - 1) }} /></PaginationItem>
              <PaginationItem><span className="px-3 text-sm text-muted-foreground">Page {page} of {pageCount}</span></PaginationItem>
              <PaginationItem><PaginationNext href={page < pageCount ? `?page=${page + 1}` : undefined} onClick={(event) => { event.preventDefault(); if (page < pageCount) setPage(page + 1) }} /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </main>
  )
}
