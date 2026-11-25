'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type CutoffOption = '15' | '20' | '25' | 'eom'
type PayrollStatus = 'ongoing' | 'draft' | 'approved'
type SimulatedDateKey = '2026-03-27' | '2026-04-15' | '2026-04-27'

interface SiteConfig {
  siteId: string
  siteName: string
  cutoffDay: CutoffOption
  employees: number
  grossPayroll: number
  allowanceAmount: number
  deductionsAmount: number
  netPayroll: number
}

interface SiteCycleRow extends SiteConfig {
  monthKey: string
  monthLabel: string
  cutoffRange: string
  status: PayrollStatus
}

const initialSites: SiteConfig[] = [
  {
    siteId: 'S1',
    siteName: 'PPLI - Nambo',
    cutoffDay: '20',
    employees: 18,
    grossPayroll: 245000000,
    allowanceAmount: 12000000,
    deductionsAmount: 55000000,
    netPayroll: 190000000,
  },
  {
    siteId: 'S2',
    siteName: 'HM Sampoerna - Sukorejo',
    cutoffDay: '25',
    employees: 15,
    grossPayroll: 185000000,
    allowanceAmount: 9000000,
    deductionsAmount: 42000000,
    netPayroll: 143000000,
  },
  {
    siteId: 'S3',
    siteName: 'Astra - Sunter',
    cutoffDay: 'eom',
    employees: 12,
    grossPayroll: 112890000,
    allowanceAmount: 7000000,
    deductionsAmount: 28000000,
    netPayroll: 84890000,
  },
]

const simulatedDates: { key: SimulatedDateKey; label: string; description: string }[] = [
  {
    key: '2026-03-27',
    label: '27 Mar 2026',
    description: 'PPLI & Sampoerna sudah tutup buku Maret dan masuk buku baru April, Astra masih di buku Maret.',
  },
  {
    key: '2026-04-15',
    label: '15 Apr 2026',
    description: 'Semua site berada di buku April, sehingga hanya tampil 1 tabel.',
  },
  {
    key: '2026-04-27',
    label: '27 Apr 2026',
    description: 'April sudah bergeser naik, PPLI & Sampoerna masuk buku baru Mei di tabel bawah.',
  },
]

const statusMeta: Record<PayrollStatus, { label: string; className: string }> = {
  ongoing: {
    label: 'Ongoing',
    className: 'bg-sky-500/10 text-sky-700 border-sky-200 dark:text-sky-300 dark:border-sky-800',
  },
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  approved: {
    label: 'Approved',
    className: 'bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-300 dark:border-amber-800',
  },
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function formatDateId(date: Date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`
}

function getMonthLabel(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function computeSiteCycle(site: SiteConfig, refDate: Date): SiteCycleRow {
  const refYear = refDate.getFullYear()
  const refMonth = refDate.getMonth()
  const refDay = refDate.getDate()

  let targetYear = refYear
  let targetMonth = refMonth

  if (site.cutoffDay !== 'eom') {
    const cutoffNumber = Number(site.cutoffDay)
    // Once the cut-off day passes and the closed cycle is finalized, the site enters next month's book.
    if (refDay > cutoffNumber) {
      targetMonth += 1
      if (targetMonth > 11) {
        targetMonth = 0
        targetYear += 1
      }
    }
  }

  let startDate: Date
  let endDate: Date

  if (site.cutoffDay === 'eom') {
    startDate = new Date(targetYear, targetMonth, 1)
    endDate = new Date(targetYear, targetMonth + 1, 0)
  } else {
    const cutoffNumber = Number(site.cutoffDay)
    const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
    const endDay = Math.min(cutoffNumber, daysInTargetMonth)
    endDate = new Date(targetYear, targetMonth, endDay)
    startDate = new Date(targetYear, targetMonth - 1, cutoffNumber + 1)
  }

  const monthKey = `${targetYear}-${pad2(targetMonth + 1)}`
  const status: PayrollStatus =
    site.cutoffDay === 'eom' && refDay >= 27 ? 'draft' : 'ongoing'

  return {
    ...site,
    monthKey,
    monthLabel: getMonthLabel(targetYear, targetMonth),
    cutoffRange: `${formatDateId(startDate)} - ${formatDateId(endDate)}`,
    status,
  }
}

export default function PayrollManagementPage() {
  const router = useRouter()
  const [simulatedDateKey, setSimulatedDateKey] = useState<SimulatedDateKey>('2026-03-27')

  const activeSimulation = simulatedDates.find((item) => item.key === simulatedDateKey) ?? simulatedDates[0]

  const monthGroups = useMemo(() => {
    const refDate = new Date(`${simulatedDateKey}T00:00:00`)
    const grouped = new Map<string, { monthKey: string; monthLabel: string; sites: SiteCycleRow[] }>()

    for (const site of initialSites) {
      const row = computeSiteCycle(site, refDate)
      const existing = grouped.get(row.monthKey)
      if (existing) {
        existing.sites.push(row)
      } else {
        grouped.set(row.monthKey, {
          monthKey: row.monthKey,
          monthLabel: row.monthLabel,
          sites: [row],
        })
      }
    }

    return Array.from(grouped.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey))
  }, [simulatedDateKey])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Kelola payroll aktif per site sesuai jadwal cut-off masing-masing site
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 size-4" />
          Export All Sites
        </Button>
      </div>

      {/* Interactive Mockup Date Switcher */}
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 text-sm">
          <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">Simulasi Tanggal Kalender (Mockup)</p>
            <p className="text-xs text-muted-foreground">{activeSimulation.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {simulatedDates.map((item) => (
            <Button
              key={item.key}
              type="button"
              size="sm"
              variant={simulatedDateKey === item.key ? 'default' : 'outline'}
              onClick={() => setSimulatedDateKey(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Dynamic Month Cycle Cards (1-2 tables depending on active site books) */}
      <div className="space-y-5">
        {monthGroups.map((group, index) => {
          const isNewBook = index > 0
          const totalEmployees = group.sites.reduce((sum, s) => sum + s.employees, 0)
          const totalGross = group.sites.reduce((sum, s) => sum + s.grossPayroll, 0)
          const totalAllowance = group.sites.reduce((sum, s) => sum + s.allowanceAmount, 0)
          const totalDeductions = group.sites.reduce((sum, s) => sum + s.deductionsAmount, 0)
          const totalNet = group.sites.reduce((sum, s) => sum + s.netPayroll, 0)

          return (
            <Card key={group.monthKey}>
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <CardTitle className="text-lg">{group.monthLabel}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {isNewBook ? 'New Book' : 'Active Cycle'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {group.sites.length} {group.sites.length === 1 ? 'site' : 'sites'} • {totalEmployees} employees
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Per-month Summary Strip */}
                <div className="grid gap-3 rounded-lg bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Payroll</p>
                    <p className="text-lg font-semibold tabular-nums">{formatCurrency(totalGross)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Allowance</p>
                    <p className="text-lg font-semibold tabular-nums text-success">{formatCurrency(totalAllowance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deductions</p>
                    <p className="text-lg font-semibold tabular-nums text-destructive">{formatCurrency(totalDeductions)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Net Pay</p>
                    <p className="text-lg font-semibold tabular-nums text-success">{formatCurrency(totalNet)}</p>
                  </div>
                </div>

                {/* 6-Column Site Table */}
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead className="text-center">Employees</TableHead>
                        <TableHead className="text-center">Cut-Off Date</TableHead>
                        <TableHead className="text-center">Total Net Pay</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.sites.map((site) => {
                        const badge = statusMeta[site.status]
                        return (
                          <TableRow key={site.siteId}>
                            <TableCell className="text-sm font-medium">{site.siteName}</TableCell>
                            <TableCell className="text-center text-sm tabular-nums">{site.employees}</TableCell>
                            <TableCell className="text-center text-sm tabular-nums text-muted-foreground">
                              {site.cutoffRange}
                            </TableCell>
                            <TableCell className="text-center text-sm font-medium tabular-nums text-success">
                              {formatCurrency(site.netPayroll)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={badge.className}>
                                {badge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/payroll/management/${site.siteId}`)}
                              >
                                Manage Details
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
      </div>
    </div>
  )
}
