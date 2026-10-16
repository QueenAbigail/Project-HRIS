'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { CalendarClock, Edit2, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { MinimumWageDialog } from './minimum-wage-dialog'
import { formatDate, formatRupiah, type SalaryBaseResponse, type SiteWage } from './types'

const ENDPOINT = '/api/payroll/salary-base'

async function fetcher(url: string): Promise<SalaryBaseResponse> {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? 'Failed to load minimum wages')
  return body
}

export function BaseSalaryTab() {
  const { data, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher)
  const [editingSite, setEditingSite] = useState<SiteWage | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleSubmit = async (siteId: string, minimumWage: number) => {
    const res = await fetch(ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, minimumWage }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return (body.error as string) ?? 'Failed to save minimum wage'
    await mutate()
    setEditingSite(null)
    return null
  }

  const cancelScheduled = async (id: string) => {
    setActionError(null)
    const res = await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setActionError(body.error ?? 'Failed to cancel scheduled change')
      return
    }
    await mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">
        {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      {data?.sites.length === 0 && (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          No sites found. Add a site in Map Site first, then set its minimum wage here.
        </div>
      )}

      <div className="grid gap-4">
        {data?.sites.map((site) => (
          <Card key={site.siteId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>{site.siteName}</CardTitle>
                    <CardDescription>{site.siteCode}</CardDescription>
                  </div>
                </div>
                <Button onClick={() => setEditingSite(site)} variant="outline" size="sm" className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Set Minimum Wage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Current Minimum Wage</Label>
                {site.current ? (
                  <>
                    <p className="mt-2 text-3xl font-bold">{formatRupiah(site.current.minimumWage)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Effective since {formatDate(site.current.effectiveDate)}</p>
                  </>
                ) : (
                  <p className="mt-2 text-lg font-medium text-muted-foreground">Not set yet</p>
                )}
              </div>

              {site.scheduled && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium">
                        Scheduled: {formatRupiah(site.scheduled.minimumWage)}
                      </p>
                      <p className="text-xs text-muted-foreground">Takes effect on {formatDate(site.scheduled.effectiveDate)}</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => cancelScheduled(site.scheduled!.id)}>
                    Cancel change
                  </Button>
                </div>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• All positions at this site use this minimum wage as their base calculation</p>
                <p>• Position allowances are added to this minimum wage to calculate final base salary</p>
                <p>• A new value takes effect on the 1st of next month, so the current cut-off period is not affected</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MinimumWageDialog
        site={editingSite}
        onOpenChange={(open) => !open && setEditingSite(null)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
