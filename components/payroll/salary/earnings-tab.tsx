'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Building2, CalendarClock, Edit2, Info, Plus, Power, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { EARNING_CALCULATION_LABELS, EARNING_UNIT_LABELS } from '@/lib/payroll-earnings'
import { EarningDialog, type EarningDialogState } from './earning-dialog'
import {
  formatDate,
  formatRupiah,
  type EarningCalculationType,
  type EarningGroupRow,
  type EarningsResponse,
} from './types'

const ENDPOINT = '/api/payroll/earnings'

async function fetcher(url: string): Promise<EarningsResponse> {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? 'Failed to load payroll earnings')
  return body
}

export function EarningsTab() {
  const { data, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher)
  const [dialogState, setDialogState] = useState<EarningDialogState | null>(null)
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [statusTarget, setStatusTarget] = useState<EarningGroupRow | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const defaultEffectiveDate = data?.today ? `${data.today.slice(0, 8)}01` : ''

  const filteredCompanies = useMemo(() => {
    if (!data) return []
    const companies =
      clientFilter === 'all'
        ? data.companies
        : data.companies.filter((c) => c.companyId === clientFilter)

    return companies.map((company) => ({
      ...company,
      rows:
        statusFilter === 'all'
          ? company.rows
          : company.rows.filter((row) => row.status === statusFilter),
    }))
  }, [data, clientFilter, statusFilter])

  const handleCreate = async (payload: {
    companyId: string
    siteId: string | null
    positionId: string | null
    name: string
    calculationType: EarningCalculationType
    amount: number
    isTaxable: boolean
  }) => {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return (body.error as string) ?? 'Failed to save earning rule'
    await mutate()
    setDialogState(null)
    return null
  }

  const handleUpdate = async (payload: {
    groupId: string
    calculationType: EarningCalculationType
    amount: number
    isTaxable: boolean
  }) => {
    const res = await fetch(ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return (body.error as string) ?? 'Failed to update earning rule'
    await mutate()
    setDialogState(null)
    return null
  }

  const handleCancelScheduled = async (scheduledId: string) => {
    setActionError(null)
    const res = await fetch(`${ENDPOINT}/${scheduledId}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setActionError(body.error ?? 'Failed to cancel scheduled change')
      return
    }
    await mutate()
  }

  const handleConfirmToggleStatus = async () => {
    if (!statusTarget) return
    setActionError(null)
    const nextStatus = statusTarget.status === 'active' ? 'inactive' : 'active'
    const res = await fetch(`${ENDPOINT}/${statusTarget.representativeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setActionError(body.error ?? 'Failed to update earning status')
    } else {
      await mutate()
    }
    setStatusTarget(null)
  }

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

  const companies = data?.companies ?? []

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
          <li>
            Configure recurring earning components per client (such as Meal, Transport, or Extra Fooding), optionally narrowed to a specific site or position.
          </li>
          <li>
            Fixed Monthly pays a flat amount per month; Per Attendance Day and Per Shift multiply the rate by recorded attendance or shifts.
          </li>
          <li>
            New rules apply from the 1st of this month. Changes to active rules take effect on the 1st of next month so the current cut-off period is not affected.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[220px]" aria-label="Filter by client">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.companyId} value={c.companyId}>
                  {c.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
            <SelectTrigger className="w-[160px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setDialogState({ mode: 'create', defaultCompanyId: clientFilter !== 'all' ? clientFilter : undefined })}
          disabled={companies.length === 0}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Earning
        </Button>
      </div>

      {companies.length === 0 && (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          No clients found. Add a client company first before configuring recurring earnings.
        </div>
      )}

      {filteredCompanies.map((company) => {
        const activeCount = company.rows.filter((r) => r.status === 'active').length
        return (
          <Card key={company.companyId}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>{company.companyName}</CardTitle>
                    <CardDescription>
                      {company.sites.length} {company.sites.length === 1 ? 'Site' : 'Sites'} • {activeCount} active{' '}
                      {activeCount === 1 ? 'earning' : 'earnings'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {company.rows.length} {company.rows.length === 1 ? 'Earning' : 'Earnings'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setDialogState({ mode: 'create', defaultCompanyId: company.companyId })}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Category</TableHead>
                      <TableHead className="min-w-[180px]">Scope</TableHead>
                      <TableHead className="min-w-[150px]">Calculation</TableHead>
                      <TableHead className="min-w-[160px] text-right">Amount</TableHead>
                      <TableHead className="w-[120px] text-center">Tax</TableHead>
                      <TableHead className="w-[100px] text-center">Status</TableHead>
                      <TableHead className="w-[110px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                          No earning rules configured for this client yet.
                        </TableCell>
                      </TableRow>
                    )}

                    {company.rows.map((row) => {
                      const activeVersion = row.current ?? row.scheduled
                      const isInactive = row.status === 'inactive'

                      return (
                        <TableRow key={row.key} className={isInactive ? 'opacity-65' : undefined}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{row.name}</p>
                              {row.current && (
                                <p className="text-xs text-muted-foreground">
                                  Since {formatDate(row.current.effectiveFrom)}
                                </p>
                              )}
                              {row.scheduled && (
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs">
                                  <CalendarClock className="h-3.5 w-3.5 shrink-0 text-warning" />
                                  <span>
                                    Upcoming ({formatDate(row.scheduled.effectiveFrom)}):{' '}
                                    <strong>{formatRupiah(row.scheduled.amount)}</strong>{' '}
                                    {EARNING_UNIT_LABELS[row.scheduled.calculationType]}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelScheduled(row.scheduled!.id)}
                                    className="font-medium text-destructive underline-offset-2 hover:underline"
                                  >
                                    Cancel change
                                  </button>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-sm">
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="outline">
                                {row.siteName ? `${row.siteName}${row.siteCode ? ` (${row.siteCode})` : ''}` : 'All Sites'}
                              </Badge>
                              <Badge variant="outline">
                                {row.positionName ?? 'All Positions'}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="text-sm">
                            {activeVersion ? EARNING_CALCULATION_LABELS[activeVersion.calculationType] : '-'}
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {activeVersion ? (
                              <div>
                                <span>{formatRupiah(activeVersion.amount)}</span>
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                  {EARNING_UNIT_LABELS[activeVersion.calculationType]}
                                </span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            {activeVersion?.isTaxable ? (
                              <Badge variant="secondary">Taxable</Badge>
                            ) : (
                              <Badge variant="outline">Non-taxable</Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            {row.status === 'active' ? (
                              <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>

                          <TableCell className="space-x-1 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDialogState({ mode: 'edit', row })}
                              aria-label={`Edit ${row.name}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatusTarget(row)}
                              aria-label={row.status === 'active' ? `Deactivate ${row.name}` : `Activate ${row.name}`}
                              title={row.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {row.status === 'active' ? (
                                <Power className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <EarningDialog
        state={dialogState}
        companies={companies}
        positions={data?.positions ?? []}
        defaultEffectiveDate={defaultEffectiveDate}
        onOpenChange={(open) => !open && setDialogState(null)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <AlertDialog open={statusTarget !== null} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.status === 'active' ? 'Deactivate earning rule' : 'Reactivate earning rule'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.status === 'active'
                ? `This deactivates "${statusTarget.name}" while preserving its historical records for past payslips.`
                : `This reactivates "${statusTarget?.name}" so it can be included in upcoming payroll calculations.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggleStatus}>
              {statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
