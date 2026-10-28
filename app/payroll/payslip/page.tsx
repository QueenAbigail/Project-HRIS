'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PayslipSummary } from '@/components/payroll/payslip/payslip-summary'
import { PayslipSiteTable } from '@/components/payroll/payslip/payslip-site-table'
import {
  payslipPeriods,
  payslipRecords,
  payslipSites,
} from '@/components/payroll/payslip/payslip-data'

export default function ManagePayslipPage() {
  const router = useRouter()
  const [period, setPeriod] = useState(payslipPeriods[0])
  const [query, setQuery] = useState('')

  const sites = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return payslipSites
    return payslipSites.filter((site) => `${site.name} ${site.location}`.toLowerCase().includes(term))
  }, [query])

  const visibleRecords = useMemo(
    () => payslipRecords.filter((record) => sites.some((site) => site.id === record.siteId)),
    [sites],
  )

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Manage Payslip</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a site to review, print, and download its employee payslips
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full md:w-44" aria-label="Payroll period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {payslipPeriods.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative md:ml-auto md:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search site or location"
            aria-label="Search sites"
            className="pl-9"
          />
        </div>
      </div>

      <PayslipSummary records={visibleRecords} />

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>All Sites - {period}</CardTitle>
          <CardDescription>Select a site to open its payslips</CardDescription>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="font-medium">No sites found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
            </div>
          ) : (
            <PayslipSiteTable
              sites={sites}
              records={payslipRecords}
              onOpen={(siteId) => router.push(`/payroll/payslip/${siteId}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
