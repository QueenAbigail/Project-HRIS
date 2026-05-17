'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/currency'

const data = [
  { month: 'Oct', total: 498000 },
  { month: 'Nov', total: 512000 },
  { month: 'Dec', total: 535000 },
  { month: 'Jan', total: 521000 },
  { month: 'Feb', total: 528000 },
  { month: 'Mar', total: 542890 },
]

export function PayrollChart() {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle>Payroll Trend</CardTitle>
        <CardDescription>Monthly payroll expenses (6 months)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Total']}
                labelStyle={{ color: 'var(--color-foreground)' }}
              />
              <Bar 
                dataKey="total" 
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Year-to-date</span>
            <span className="font-medium">{formatCurrency(1591890)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly average</span>
            <span className="font-medium">{formatCurrency(530630)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
