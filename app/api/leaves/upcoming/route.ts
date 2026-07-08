import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET() {
  try {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Start of today
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Show leaves where the end date hasn't passed yet (leave is still ongoing or upcoming)
    // This includes leaves from previous months that are still active, and future leaves
    const upcoming = await prisma.leave.findMany({
      where: {
        status: 'Approved',
        endDate: { gte: now }, // Only leaves that haven't ended yet
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    })

    // Map leave type from database value to display label
    const leaveTypeMap: Record<string, string> = {
      'Izin': 'Cuti',
      'Sakit': 'Sakit',
      'TukarShift': 'Tukar Shift',
    }

    const formatted = upcoming.map(leave => ({
      name: leave.user?.name || 'Unknown',
      type: leaveTypeMap[leave.leaveType] || leave.leaveType,
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
