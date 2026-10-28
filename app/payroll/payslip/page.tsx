'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
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
  payslipPeriods,
  payslipRecords,
  type PayslipRecord,
} from '@/components/payroll/payslip/payslip-data'

const departments = ['All Departments', ...Array.from(new Set(payslipRecords.map((r) => r.department)))]
const statuses = ['All Status', 'paid', 'pending', 'failed']

export default function ManagePayslipPage() {
  const [period, setPeriod] = useState(payslipPeriods[0])
  const [department, setDepartment] = useState(departments[0])
  const [status, setStatus] = useState(statuses[0])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PayslipRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return payslipRecords.filter((record) => {
      if (department !== departments[0] && record.department !== department) return false
      if (status !== statuses[0] && record.status !== status) return false
      if (term && !`${record.name} ${record.id}`.toLowerCase().includes(term)) return false
      return true
    })
  }, [department, status, query])

  const handleView = (record: PayslipRecord) => {
    setSelected(record)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Manage Payslip</h1>
        <p className="mt-2 text-muted-foreground">
          Review, print, and download employee payslips for each payroll period
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
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full md:w-48" aria-label="Department">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full capitalize md:w-40" aria-label="Payment status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
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
            placeholder="Search employee name or ID"
            aria-label="Search payslips"
            className="pl-9"
          />
        </div>
      </div>

      <PayslipSummary records={filtered} />

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Payslips - {period}</CardTitle>
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

      <PayslipDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        employee={selected}
        period={period}
      />
    </div>
  )
}
