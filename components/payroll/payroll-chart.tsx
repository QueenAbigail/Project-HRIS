'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'

const monthlyData = [
  { month: 'Oct', total: 498000, deductions: 108000, employees: 238, overtime: 62500, allowance: 18000 },
  { month: 'Nov', total: 512000, deductions: 111000, employees: 241, overtime: 68000, allowance: 21000 },
  { month: 'Dec', total: 535000, deductions: 118000, employees: 244, overtime: 74500, allowance: 24000 },
  { month: 'Jan', total: 521000, deductions: 115000, employees: 242, overtime: 71000, allowance: 22000 },
  { month: 'Feb', total: 528000, deductions: 119000, employees: 245, overtime: 70000, allowance: 26000 },
  { month: 'Mar', total: 542890, deductions: 125000, employees: 247, overtime: 78500, allowance: 28000 },
]

const current = monthlyData[monthlyData.length - 1]
const previous = monthlyData[monthlyData.length - 2]
const currentNet = current.total - current.deductions
const previousNet = previous.total - previous.deductions
const change = current.total - previous.total
const netChange = currentNet - previousNet
const changePercent = ((change / previous.total) * 100).toFixed(1)
const netChangePercent = ((netChange / previousNet) * 100).toFixed(1)
const deductionRate = (current.deductions / current.total) * 100

function TrendValue({ value, suffix = '' }: { value: string; suffix?: string }) {
  const positive = Number.parseFloat(value) >= 0
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span className={positive ? 'inline-flex items-center gap-1 text-success' : 'inline-flex items-center gap-1 text-destructive'}>
      <Icon className="size-4" aria-hidden="true" />
      {positive ? '+' : ''}{value}{suffix}
    </span>
  )
}

export function PayrollChart() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Current gross payroll</p><p className="mt-1 text-xl font-semibold">{formatCurrency(current.total)}</p><p className="mt-1 text-xs"><TrendValue value={changePercent} suffix=" vs last month" /></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Current net payroll</p><p className="mt-1 text-xl font-semibold text-success">{formatCurrency(currentNet)}</p><p className="mt-1 text-xs"><TrendValue value={netChangePercent} suffix=" vs last month" /></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Current deductions</p><p className="mt-1 text-xl font-semibold text-destructive">{formatCurrency(current.deductions)}</p><p className="mt-1 text-xs text-muted-foreground">{deductionRate.toFixed(1)}% of gross payroll</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Employees paid</p><p className="mt-1 text-xl font-semibold">{current.employees}</p><p className="mt-1 text-xs text-success">100% processed</p></CardContent></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Gross vs net payroll</CardTitle><CardDescription>Gross payroll compared with employee take-home pay after deductions</CardDescription></CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} formatter={(value: number, name: string) => [formatCurrency(value), name === 'net' ? 'Net payroll' : 'Gross payroll']} />
                  <Bar dataKey="total" name="gross" fill="var(--color-primary)" fillOpacity={0.45} radius={[5, 5, 0, 0]} />
                  <Bar dataKey={(month) => month.total - month.deductions} name="net" fill="var(--color-success)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Gross-to-net bridge</CardTitle><CardDescription>March 2026 payroll composition</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3"><span className="text-sm text-muted-foreground">Gross payroll</span><span className="font-semibold">{formatCurrency(current.total)}</span></div>
            <div className="space-y-3 pl-3">
              <div><div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Base payroll</span><span className="font-medium">{formatCurrency(current.total - current.overtime - current.allowance)}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${((current.total - current.overtime - current.allowance) / current.total) * 100}%` }} /></div></div>
              <div><div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Overtime + allowance</span><span className="font-medium text-success">{formatCurrency(current.overtime + current.allowance)}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-success" style={{ width: `${((current.overtime + current.allowance) / current.total) * 100}%` }} /></div></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3"><span className="text-sm text-muted-foreground">Less: deductions</span><span className="font-semibold text-destructive">− {formatCurrency(current.deductions)}</span></div>
            <div className="flex items-center justify-between border-t pt-4"><span className="font-medium">Net payroll</span><span className="text-lg font-semibold text-success">{formatCurrency(currentNet)}</span></div>
            <p className="text-xs text-muted-foreground">Deductions reduce gross payroll by {deductionRate.toFixed(1)}%, resulting in the net amount employees receive.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly gross-to-net summary</CardTitle><CardDescription>See how deductions affect the payroll employees receive</CardDescription></CardHeader>
        <CardContent><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Month</th><th className="pb-3 text-right font-medium">Employees</th><th className="pb-3 text-right font-medium">Gross</th><th className="pb-3 text-right font-medium">Deductions</th><th className="pb-3 text-right font-medium">Net pay</th><th className="pb-3 text-right font-medium">Change</th></tr></thead><tbody>{monthlyData.map((month, index) => { const prior = monthlyData[index - 1]; const delta = prior ? ((month.total - prior.total) / prior.total * 100).toFixed(1) : '—'; return <tr key={month.month} className="border-b last:border-0"><td className="py-3 font-medium">{month.month} 2026</td><td className="py-3 text-right tabular-nums text-muted-foreground">{month.employees}</td><td className="py-3 text-right font-medium tabular-nums">{formatCurrency(month.total)}</td><td className="py-3 text-right tabular-nums text-destructive">{formatCurrency(month.deductions)}</td><td className="py-3 text-right font-medium tabular-nums text-success">{formatCurrency(month.total - month.deductions)}</td><td className="py-3 text-right tabular-nums">{prior ? <TrendValue value={delta} suffix="% gross" /> : '—'}</td></tr>})}</tbody></table></div></CardContent>
      </Card>
    </div>
  )
}
