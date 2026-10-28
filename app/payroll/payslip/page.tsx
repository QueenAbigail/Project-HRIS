'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { PayslipSummary } from '@/components/payroll/payslip/payslip-summary'
import {
  formatPayslipAmount,
  getGross,
  payslipPeriods,
  payslipRecords,
  payslipSites,
} from '@/components/payroll/payslip/payslip-data'

function getSiteStatus(paid: number, total: number) {
  if (paid === total) return { label: 'Published', className: 'bg-success/10 text-success border-success/20' }
  if (paid === 0) return { label: 'Ready to Publish', className: 'bg-muted text-muted-foreground border-border' }
  return { label: 'Partially Published', className: 'bg-warning/10 text-warning border-warning/20' }
}

export default function ManagePayslipPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [expandedPeriods, setExpandedPeriods] = useState([payslipPeriods[0]])

  const sites = useMemo(() => {
    const term = query.trim().toLowerCase()
    return term
      ? payslipSites.filter((site) => `${site.name} ${site.location}`.toLowerCase().includes(term))
      : payslipSites
  }, [query])

  const togglePeriod = (period: string) => {
    setExpandedPeriods((current) => current.includes(period)
      ? current.filter((item) => item !== period)
      : [...current, period])
  }

  const totalGross = payslipRecords.reduce((sum, record) => sum + getGross(record), 0)
  const totalDeductions = payslipRecords.reduce((sum, record) => sum + record.deductions, 0)
  const totalNet = payslipRecords.reduce((sum, record) => sum + record.netPay, 0)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Manage Payslip</h1>
        <p className="mt-2 text-muted-foreground">Browse, publish, print, and download payslips by locked payroll period</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:ml-auto sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search site or location" aria-label="Search sites" className="pl-9" />
        </div>
      </div>

      <PayslipSummary records={payslipRecords} />

      <div className="space-y-3">
        {payslipPeriods.map((period, index) => {
          const expanded = expandedPeriods.includes(period)
          const isLatest = index === 0
          return (
            <Card key={period}>
              <CardHeader className="p-4 sm:p-5">
                <button type="button" onClick={() => togglePeriod(period)} className="flex w-full items-center gap-3 text-left">
                  {expanded ? <ChevronDown className="size-5 text-muted-foreground" aria-hidden="true" /> : <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{period}</CardTitle>
                    <CardDescription>{payslipRecords.length} payslips · {formatPayslipAmount(totalNet)} total net pay</CardDescription>
                  </div>
                  <Badge variant="outline" className={isLatest ? 'border-warning/30 bg-warning/10 text-warning' : 'border-success/20 bg-success/10 text-success'}>
                    {isLatest ? 'Ready to Publish' : 'Archived'}
                  </Badge>
                </button>
              </CardHeader>
              {expanded && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="grid gap-3 rounded-lg bg-muted/30 p-3 sm:grid-cols-3">
                    <div><p className="text-xs text-muted-foreground">Gross payroll</p><p className="font-semibold">{formatPayslipAmount(totalGross)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Deductions</p><p className="font-semibold text-destructive">{formatPayslipAmount(totalDeductions)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Net payroll</p><p className="font-semibold text-success">{formatPayslipAmount(totalNet)}</p></div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[780px] text-sm">
                      <thead className="border-b bg-muted/20"><tr className="text-left"><th className="p-3 font-medium">Site</th><th className="p-3 text-right font-medium">Payslips</th><th className="p-3 text-right font-medium">Net Pay</th><th className="p-3 font-medium">Publication</th><th className="p-3 text-right font-medium">Action</th></tr></thead>
                      <tbody>
                        {sites.map((site) => {
                          const siteRecords = payslipRecords.filter((record) => record.siteId === site.id)
                          const paid = siteRecords.filter((record) => record.status === 'paid').length
                          const status = getSiteStatus(paid, siteRecords.length)
                          return (
                            <tr key={`${period}-${site.id}`} className="border-b last:border-0">
                              <td className="p-3"><p className="font-medium">{site.name}</p><p className="text-xs text-muted-foreground">{site.location}</p></td>
                              <td className="p-3 text-right">{siteRecords.length}</td>
                              <td className="p-3 text-right font-medium">{formatPayslipAmount(siteRecords.reduce((sum, record) => sum + record.netPay, 0))}</td>
                              <td className="p-3"><div className="flex items-center gap-2"><Progress value={siteRecords.length ? (paid / siteRecords.length) * 100 : 0} className="h-1.5 max-w-24" /><span className="text-xs text-muted-foreground">{paid}/{siteRecords.length}</span><Badge variant="outline" className={status.className}>{status.label}</Badge></div></td>
                              <td className="p-3 text-right"><Button variant="outline" size="sm" onClick={() => router.push(`/payroll/payslip/${site.id}?period=${encodeURIComponent(period)}`)}>View Payslips</Button></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">{isLatest ? 'Publish becomes available after payroll is locked and approved.' : 'Archived period: payslips are read-only for audit, printing, and download.'}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
