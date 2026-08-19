import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { tallyAttendance, computeAttendanceRate } from '@/lib/attendance-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const siteId = searchParams.get('siteId')
    const dateFrom = searchParams.get('dateFrom') || searchParams.get('date') || new Date().toISOString().split('T')[0]
    const dateTo = searchParams.get('dateTo') || dateFrom

    // Build one range shared by all stats queries.
    const where: any = {
      date: {
        gte: startOfDay(new Date(dateFrom)),
        lte: endOfDay(new Date(dateTo)),
      }
    }
    
    const department = searchParams.get('department')
    if (siteId && siteId !== 'all') {
      where.locationId = siteId
    }
    if (department && department !== 'all') {
      where.user = { department }
    }

    const employeeWhere: Record<string, unknown> = { status: 'ACTIVE' }
    if (siteId && siteId !== 'all') employeeWhere.siteId = siteId
    if (department && department !== 'all') employeeWhere.department = department

    const employeeCountPromise = prisma.user.count({ where: employeeWhere })

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
              gte: startOfDay(new Date(dateFrom)),
              lte: endOfDay(new Date(dateTo)),
            },
            ...(siteId && siteId !== 'all' ? { backupEmployee: { siteId } } : {}),
          },
        }).catch(() => [])
      : Promise.resolve([])

    const [attendance, bkoAssignments, totalEmployees] = await Promise.all([
      attendancePromise,
      bkoPromise,
      employeeCountPromise,
    ])

    // Calculate stats using the shared canonical tally (single source of truth)
    const tally = tallyAttendance(attendance)
    const presentToday = tally.present
    const lateCheckIns = tally.late
    const absentToday = tally.absent
    const notCheckedIn = tally.notCheckedIn
    const onLeave = tally.onLeave
    const averageLateMinutes = tally.averageLateMinutes
    const dayOff = 0

    const expectedToWork = Math.max(totalEmployees - dayOff, 0)
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
