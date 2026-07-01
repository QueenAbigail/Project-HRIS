'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface LeaveBalance {
  type: string
  used: number
  total: number
}

interface UpcomingLeave {
  name: string
  type: string
  startDate: string
  endDate: string
  days: number
}

export function LeaveBalance() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveBalance[]>([])
  const [upcomingLeaves, setUpcomingLeaves] = useState<UpcomingLeave[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const [balanceRes, upcomingRes] = await Promise.all([
          fetch('/api/leaves/balance'),
          fetch('/api/leaves/upcoming'),
        ])

        if (balanceRes.ok) {
          const data = await balanceRes.json()
          setLeaveTypes(data)
        }

        if (upcomingRes.ok) {
          const data = await upcomingRes.json()
          setUpcomingLeaves(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch leave balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [])

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Company Leave Balance</CardTitle>
          <CardDescription>Average leave usage across all employees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : leaveTypes.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No leave data available</div>
          ) : (
            leaveTypes.map((leave) => (
              <div key={leave.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{leave.type}</span>
                  <span className="font-medium">
                    {leave.used}/{leave.total} days
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={(leave.used / leave.total) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Upcoming Leaves</CardTitle>
          <CardDescription>Approved leaves this month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : upcomingLeaves.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No upcoming leaves</div>
          ) : (
            upcomingLeaves.map((leave, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{leave.name}</p>
                  <p className="text-xs text-muted-foreground">{leave.type} - {leave.startDate}</p>
                </div>
                <span className="text-sm text-muted-foreground">{leave.days} days</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
