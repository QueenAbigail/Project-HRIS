'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'

const monthlyData = [
  { month: 'Oct', total: 498000, employees: 238, overtime: 62500, allowance: 18000 },
  { month: 'Nov', total: 512000, employees: 241, overtime: 68000, allowance: 21000 },
  { month: 'Dec', total: 535000, employees: 244, overtime: 74500, allowance: 24000 },
  { month: 'Jan', total: 521000, employees: 242, overtime: 71000, allowance: 22000 },
  { month: 'Feb', total: 528000, employees: 245, overtime: 70000, allowance: 26000 },
  { month: 'Mar', total: 542890, employees: 247, overtime: 78500, allowance: 28000 },
]

const current = monthlyData[monthlyData.length - 1]
const previous = monthlyData[monthlyData.length - 2]
const change = current.total - previous.total
const changePercent = ((change / previous.total) * 100).toFixed(1)
const average = monthlyData.reduce((sum, month) => sum + month.total, 0) / monthlyData.length
const highest = monthlyData.reduce((max, month) => (month.total > max.total ? month : max), monthlyData[0])

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
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Current payroll</p><p className="mt-1 text-xl font-semibold">{formatCurrency(current.total)}</p><p className="mt-1 text-xs"><TrendValue value={changePercent} suffix=" vs last month" /></p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Six-month average</p><p className="mt-1 text-xl font-semibold">{formatCurrency(average)}</p><p className="mt-1 text-xs text-muted-foreground">Monthly payroll spend</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Highest month</p><p className="mt-1 text-xl font-semibold">{formatCurrency(highest.total)}</p><p className="mt-1 text-xs text-muted-foreground">{highest.month} 2026</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Employees paid</p><p className="mt-1 text-xl font-semibold">{current.employees}</p><p className="mt-1 text-xs text-success">100% processed</p></CardContent></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Payroll movement</CardTitle><CardDescription>Total payroll across the last six months</CardDescription></CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} formatter={(value: number) => [formatCurrency(value), 'Payroll']} />
                  <Bar dataKey="total" radius={[5, 5, 0, 0]}>
                    {monthlyData.map((entry) => <Cell key={entry.month} fill={entry.month === current.month ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} fillOpacity={entry.month === current.month ? 1 : 0.45} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cost drivers</CardTitle><CardDescription>March 2026 composition</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Base payroll</span><span className="font-medium">{formatCurrency(current.total - current.overtime - current.allowance)}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[80%] rounded-full bg-primary" /></div></div>
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Overtime</span><span className="font-medium text-success">{formatCurrency(current.overtime)}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[14%] rounded-full bg-success" /></div></div>
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Allowance</span><span className="font-medium text-success">{formatCurrency(current.allowance)}</span></div><div className="h-2 rounded-full bg-muted"><div className="h-2 w-[6%] rounded-full bg-success/70" /></div></div>
            <div className="border-t pt-4 text-xs text-muted-foreground">Overtime and allowance together represent {(((current.overtime + current.allowance) / current.total) * 100).toFixed(1)}% of current payroll spend.</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly payroll summary</CardTitle><CardDescription>Compare spend, headcount, overtime, and allowance at a glance</CardDescription></CardHeader>
        <CardContent><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Month</th><th className="pb-3 text-right font-medium">Employees</th><th className="pb-3 text-right font-medium">Payroll</th><th className="pb-3 text-right font-medium">Overtime</th><th className="pb-3 text-right font-medium">Allowance</th><th className="pb-3 text-right font-medium">Change</th></tr></thead><tbody>{monthlyData.map((month, index) => { const prior = monthlyData[index - 1]; const delta = prior ? ((month.total - prior.total) / prior.total * 100).toFixed(1) : '—'; return <tr key={month.month} className="border-b last:border-0"><td className="py-3 font-medium">{month.month} 2026</td><td className="py-3 text-right tabular-nums text-muted-foreground">{month.employees}</td><td className="py-3 text-right font-medium tabular-nums">{formatCurrency(month.total)}</td><td className="py-3 text-right tabular-nums text-success">{formatCurrency(month.overtime)}</td><td className="py-3 text-right tabular-nums text-success">{formatCurrency(month.allowance)}</td><td className="py-3 text-right tabular-nums">{prior ? <TrendValue value={delta} suffix="%" /> : '—'}</td></tr>})}</tbody></table></div></CardContent>
      </Card>
    </div>
  )
}
