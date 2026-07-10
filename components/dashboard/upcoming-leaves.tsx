'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface UpcomingLeave {
  name: string
  type: string
  startDate: string
  endDate: string
  days: number
}

export function UpcomingLeaves() {
  const [leaves, setLeaves] = useState<UpcomingLeave[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingLeaves = async () => {
      try {
        const response = await fetch('/api/leaves/upcoming')
        if (response.ok) {
          const data = await response.json()
          setLeaves(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch upcoming leaves:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingLeaves()
  }, [])

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cuti':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'sakit':
        return 'bg-chart-5/10 text-chart-5 border-chart-5/20'
      case 'tukar shift':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Leaves</CardTitle>
        <CardDescription>Approved leaves this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Loading...
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No upcoming leaves
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.map((leave, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{leave.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {leave.startDate} to {leave.endDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getLeaveTypeColor(leave.type)}>
                    {leave.type}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground min-w-fit">{leave.days}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
