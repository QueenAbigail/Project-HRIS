'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PayslipDrawer } from '@/components/payroll/payslip-drawer'
import { PayslipSummary } from '@/components/payroll/payslip/payslip-summary'
import { PayslipTable } from '@/components/payroll/payslip/payslip-table'
import {
  getSite,
  getSiteRecords,
  payslipPeriods,
  type PayslipRecord,
} from '@/components/payroll/payslip/payslip-data'

const statuses = ['All Status', 'sent', 'not-sent']

export default function SitePayslipPage() {
  const router = useRouter()
  const params = useParams<{ siteId: string }>()
  const searchParams = useSearchParams()
  const period = searchParams.get('period') ?? payslipPeriods[0]
  const site = getSite(params.siteId)
  const siteRecords = useMemo(() => getSiteRecords(params.siteId), [params.siteId])

  const [status, setStatus] = useState(statuses[0])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PayslipRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return siteRecords.filter((record) => {
      if (status !== statuses[0] && record.status !== status) return false
      if (term && !`${record.name} ${record.id}`.toLowerCase().includes(term)) return false
      return true
    })
    }, [siteRecords, status, query])

  if (!site) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="ghost" className="gap-2" onClick={() => router.push('/payroll/payslip')}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Sites
        </Button>
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">Site not found</p>
          <p className="mt-1 text-sm text-muted-foreground">This site does not exist or has no payslips.</p>
        </div>
      </div>
    )
  }

  const handleView = (record: PayslipRecord) => {
    setSelected(record)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 gap-2 text-muted-foreground"
          onClick={() => router.push('/payroll/payslip')}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Sites
        </Button>
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <MapPin className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{site.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {site.location} - {siteRecords.length} employees - {period}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-40" aria-label="Payslip delivery status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((item) => (
<SelectItem key={item} value={item}>
                              {item === 'not-sent' ? 'Not Sent' : item === 'sent' ? 'Sent' : item}
                            </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PayslipSummary records={filtered} />

      <Card className="bg-card border-border">
        <CardHeader className="gap-4">
          <CardTitle>
            {site.name} Payslips - {period}
          </CardTitle>
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employee name or ID"
              aria-label="Search payslips"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="font-medium">No payslips found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try changing the filters or search term.</p>
            </div>
          ) : (
            <PayslipTable records={filtered} onView={handleView} />
          )}
        </CardContent>
      </Card>

      <PayslipDrawer open={drawerOpen} onOpenChange={setDrawerOpen} employee={selected} period={period} />
    </div>
  )
}
