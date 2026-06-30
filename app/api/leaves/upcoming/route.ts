import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET() {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const upcoming = await prisma.leave.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    })

    const formatted = upcoming.map(leave => ({
      name: leave.user?.name || 'Unknown',
      type: leave.leaveType,
      startDate: format(new Date(leave.startDate), 'MMM d'),
      endDate: format(new Date(leave.endDate), 'MMM d'),
      days: Math.ceil(
        (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 
        (1000 * 60 * 60 * 24)
      ) + 1,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[v0] Error fetching upcoming leaves:', error)
    return NextResponse.json({ error: 'Failed to fetch upcoming leaves' }, { status: 500 })
  }
}
