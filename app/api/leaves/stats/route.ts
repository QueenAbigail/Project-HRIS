import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLeaveReadAuthorization, leaveAuthorizationResponse } from '@/lib/leave-authorization'
import { getBusinessDateBounds } from '@/lib/timezone'

export async function GET() {
  try {
    const authorization = await getLeaveReadAuthorization()
    if (!authorization.user) return leaveAuthorizationResponse(authorization.error)

    const now = new Date()
    const { monthStart, monthEnd } = getBusinessDateBounds(now)

    const [pending, approvedThisMonth, rejectedThisMonth, onLeaveToday] = await Promise.all([
      prisma.leave.count({ where: { ...authorization.where, status: 'Pending' } }),
      prisma.leave.count({
        where: {
          ...authorization.where,
          status: 'Approved',
          updatedAt: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.leave.count({
        where: {
          ...authorization.where,
          status: 'Rejected',
          updatedAt: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.leave.count({
        where: {
          ...authorization.where,
          status: 'Approved',
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
    ])

    return NextResponse.json({
      pending,
      approvedThisMonth,
      rejectedThisMonth,
      onLeaveToday,
    })
  } catch (error) {
    console.error('[v0] Error fetching leave stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
