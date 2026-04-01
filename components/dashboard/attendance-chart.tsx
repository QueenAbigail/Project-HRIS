'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

const data = [
  { date: 'Mon', present: 185, absent: 12, late: 8 },
  { date: 'Tue', present: 192, absent: 8, late: 5 },
  { date: 'Wed', present: 188, absent: 15, late: 10 },
  { date: 'Thu', present: 195, absent: 5, late: 3 },
  { date: 'Fri', present: 178, absent: 18, late: 12 },
  { date: 'Sat', present: 145, absent: 8, late: 6 },
  { date: 'Sun', present: 120, absent: 5, late: 4 },
]

export function AttendanceChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Weekly attendance trend for all security personnel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
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
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                labelStyle={{ color: 'var(--color-foreground)' }}
              />
              <Area
                type="monotone"
                dataKey="present"
                stroke="var(--color-chart-1)"
                fill="url(#presentGradient)"
                strokeWidth={2}
                name="Present"
              />
              <Area
                type="monotone"
                dataKey="absent"
                stroke="var(--color-chart-5)"
                fill="url(#absentGradient)"
                strokeWidth={2}
                name="Absent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 pt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-chart-5" />
            <span className="text-muted-foreground">Absent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
