'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { AlertTriangle, CalendarClock, Edit2, Info, MapPin, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AddPositionPicker } from './add-position-picker'
import { AllowanceDialog, type AllowanceTarget } from './allowance-dialog'
import {
  formatDate,
  formatRupiah,
  type PositionRow,
  type PositionSalaryResponse,
  type SitePositions,
} from './types'

const ENDPOINT = '/api/payroll/salary-rules'

async function fetcher(url: string): Promise<PositionSalaryResponse> {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? 'Failed to load position salaries')
  return body
}

interface RemoveTarget {
  siteId: string
  siteName: string
  row: PositionRow
}

export function PositionSalaryTab() {
  const { data, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher)
  const [editing, setEditing] = useState<AllowanceTarget | null>(null)
  const [removing, setRemoving] = useState<RemoveTarget | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleSubmit = async (siteId: string, positionId: string, positionAllowance: number) => {
    const res = await fetch(ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, positionId, positionAllowance }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return (body.error as string) ?? 'Failed to save position allowance'
    await mutate()
    setEditing(null)
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

  const confirmRemove = async () => {
    if (!removing) return
    setActionError(null)
    const params = new URLSearchParams({ siteId: removing.siteId, positionId: removing.row.positionId })
    const res = await fetch(`${ENDPOINT}?${params}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setActionError(body.error ?? 'Failed to remove position salary')
    } else {
      await mutate()
    }
    setRemoving(null)
  }

  const openEditor = (site: SitePositions, row: PositionRow) => {
    if (site.minimumWage === null) return
    setEditing({ siteId: site.siteId, siteName: site.siteName, minimumWage: site.minimumWage, row })
  }

  const addPosition = (site: SitePositions, position: { id: string; name: string }) =>
    openEditor(site, {
      positionId: position.id,
      positionName: position.name,
      employeeCount: 0,
      current: null,
      scheduled: null,
      pendingEffectiveDate: data?.today.slice(0, 8).concat('01') ?? '',
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
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

      <div className="flex gap-3 rounded-lg border bg-muted/40 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>Each site lists the positions that have employees there. Use Add another position for any other.</li>
          <li>Base salary = the site&apos;s minimum wage + the position allowance.</li>
          <li>A changed allowance takes effect on the 1st of next month, so the current cut-off period is not affected.</li>
        </ul>
      </div>

      {data?.sites.length === 0 && (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          No sites found. Add a site in Map Site first.
        </div>
      )}

      {data?.sites.map((site) => {
        const noWage = site.minimumWage === null
        const listed = new Set(site.rows.map((r) => r.positionId))
        const options = (data.positions ?? []).filter((p) => !listed.has(p.id))

        return (
          <Card key={site.siteId}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>{site.siteName}</CardTitle>
                    <CardDescription>
                      {site.siteCode} • Minimum Wage: {noWage ? 'Not set' : formatRupiah(site.minimumWage!)}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  {site.rows.length} {site.rows.length === 1 ? 'Position' : 'Positions'}
                </Badge>
              </div>
              {noWage && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                  Set this site&apos;s minimum wage in Manage Base Salary before setting position allowances.
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table className="table-fixed">
                  <colgroup>
                    <col className="w-[220px]" />
                    <col className="w-[72px]" />
                    <col className="w-[150px]" />
                    <col className="w-[150px]" />
                    <col className="w-[150px]" />
                    <col className="w-[96px]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[220px]">Position</TableHead>
                      <TableHead className="w-[72px] px-2 text-center">Employees</TableHead>
                      <TableHead className="w-[150px] text-right">Base Salary</TableHead>
                      <TableHead className="w-[150px] text-right">Position Allowance</TableHead>
                      <TableHead className="w-[150px] text-right">Total Salary</TableHead>
                      <TableHead className="w-[96px] px-2 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {site.rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                          No employees at this site yet. Add a position below to set its allowance.
                        </TableCell>
                      </TableRow>
                    )}
                    {site.rows.map((row) => (
                      <TableRow key={row.positionId}>
                        <TableCell className="font-medium">{row.positionName}</TableCell>
                        <TableCell className="w-[72px] px-2 text-center text-sm">{row.employeeCount}</TableCell>
                        <TableCell className="w-[150px] text-right text-sm">
                          {site.minimumWage !== null ? formatRupiah(site.minimumWage) : <span className="text-muted-foreground">Not set</span>}
                        </TableCell>
                        <TableCell className="w-[150px] text-right text-sm">
                          {row.current ? formatRupiah(row.current.positionAllowance) : <span className="text-muted-foreground">Not set</span>}
                        </TableCell>
                        <TableCell className="w-[150px] text-right font-medium">
                          {row.current && site.minimumWage !== null
                            ? formatRupiah(site.minimumWage + row.current.positionAllowance)
                            : <span className="font-normal text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="w-[96px] space-x-1 px-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={noWage}
                            onClick={() => openEditor(site, row)}
                            aria-label={`Edit allowance for ${row.positionName}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!row.current && !row.scheduled}
                            onClick={() => setRemoving({ siteId: site.siteId, siteName: site.siteName, row })}
                            aria-label={`Remove allowance for ${row.positionName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5}>
                        <AddPositionPicker
                          options={options}
                          disabled={noWage}
                          onPick={(position) => addPosition(site, position)}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <AllowanceDialog
        target={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove position allowance</AlertDialogTitle>
            <AlertDialogDescription>
              {removing &&
                `This removes the allowance (including any scheduled change) for ${removing.row.positionName} at ${removing.siteName}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
