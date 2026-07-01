import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const [pending, approvedThisMonth, rejectedThisMonth, onLeaveToday] = await Promise.all([
      prisma.leave.count({ where: { status: 'Pending' } }),
      prisma.leave.count({
        where: {
          status: 'Approved',
          updatedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.leave.count({
        where: {
          status: 'Rejected',
          updatedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.leave.count({
        where: {
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
