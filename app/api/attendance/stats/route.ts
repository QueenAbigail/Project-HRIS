import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { tallyAttendance, computeAttendanceRate } from '@/lib/attendance-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const siteId = searchParams.get('siteId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Build where clause
    const where: any = {
      date: {
        gte: startOfDay(new Date(date)),
        lte: endOfDay(new Date(date)),
      }
    }
    
    if (siteId && siteId !== 'all') {
      where.locationId = siteId
    }

    // Fetch only fields needed by the canonical tally; stats do not need
    // the full employee or location relations.
    const attendancePromise = prisma.attendance.findMany({
      where,
      select: {
        actualCheckIn: true,
        status: true,
        lateMinutes: true,
      },
    })

    // BKO is optional in some deployments; do not fail the whole stats API
    // when the generated Prisma client does not expose that model.
    const bkoModel = (prisma as typeof prisma & {
      bko?: {
        findMany: (args: { where: Record<string, unknown> }) => Promise<unknown[]>
      }
    }).bko

    const bkoPromise = bkoModel
      ? bkoModel.findMany({
          where: {
            date: {
              gte: startOfDay(new Date(date)),
              lte: endOfDay(new Date(date)),
            },
            ...(siteId && siteId !== 'all' ? { backupEmployee: { siteId } } : {}),
          },
        }).catch(() => [])
      : Promise.resolve([])

    const [attendance, bkoAssignments] = await Promise.all([attendancePromise, bkoPromise])

    // Calculate stats using the shared canonical tally (single source of truth)
    const tally = tallyAttendance(attendance)
    const presentToday = tally.present
    const lateCheckIns = tally.late
    const absentToday = tally.absent
    const notCheckedIn = tally.notCheckedIn
    const onLeave = tally.onLeave
    const averageLateMinutes = tally.averageLateMinutes
    const dayOff = 0

    const totalEmployees = attendance.length || 1 // Prevent division by zero
    const expectedToWork = totalEmployees - dayOff
    const attendanceRate = computeAttendanceRate(presentToday, lateCheckIns, expectedToWork)

    const bkoCount = bkoAssignments.length

    return NextResponse.json({
      presentToday,
      absentToday,
      lateCheckIns,
      notCheckedIn,
      averageLateMinutes,
      onLeave,
      dayOff,
      totalEmployees,
      expectedToWork,
      attendanceRate,
      bkoCount,
    })
  } catch (error) {
    console.error('[v0] Error fetching attendance stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance stats' },
      { status: 500 }
    )
  }
}
