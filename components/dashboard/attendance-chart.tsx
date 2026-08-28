'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Users } from 'lucide-react'

interface AttendanceChartProps {
  chartData: Array<{ date: string; present: number; absent: number; late: number }>;
}

export function AttendanceChart({ chartData }: AttendanceChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Weekly attendance trend for all security personnel</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Belum ada data attendance mingguan</p>
            <p className="text-sm text-muted-foreground">Grafik akan muncul setelah data tersedia.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Weekly attendance trend for all security personnel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
<AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
