import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { tallyAttendance, computeAttendanceRate } from '@/lib/attendance-utils'
import { getCurrentUser } from '@/lib/system'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const requestedSite = siteId && siteId !== 'all'
      ? await prisma.site.findUnique({ select: { id: true, companyId: true }, where: { id: siteId } })
      : null

    if (siteId && siteId !== 'all' && !requestedSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const isUnrestricted = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN'
    if (!isUnrestricted && requestedSite && requestedSite.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
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
    } else if (!isUnrestricted) {
      where.location = { company: { id: currentUser.companyId } }
    }
    if (department && department !== 'all') {
      where.user = { department }
    }

    const employeeWhere: Record<string, unknown> = { status: 'ACTIVE' }
    if (siteId && siteId !== 'all') employeeWhere.siteId = siteId
    else if (!isUnrestricted) employeeWhere.companyId = currentUser.companyId
    if (department && department !== 'all') employeeWhere.department = department

    const scheduledEmployeesPromise = prisma.schedule.findMany({
      where: {
        scheduleDate: {
          gte: startOfDay(new Date(dateFrom)),
          lte: endOfDay(new Date(dateTo)),
        },
        employee: employeeWhere,
      },
      select: { employeeId: true, scheduleDate: true },
    })

    const approvedLeavesPromise = prisma.leave.findMany({
      where: {
        status: 'Approved',
        startDate: { lte: endOfDay(new Date(dateTo)) },
        endDate: { gte: startOfDay(new Date(dateFrom)) },
        user: employeeWhere,
      },
      select: { userId: true, startDate: true, endDate: true },
    })

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

    const bkoPromise = prisma.bkoAssignment.count({
      where: {
        status: 'Aktif',
        leave: {
          startDate: { lte: endOfDay(new Date(dateTo)) },
          endDate: { gte: startOfDay(new Date(dateFrom)) },
        },
        substitute: {
          status: 'ACTIVE',
          ...(siteId && siteId !== 'all' ? { siteId } : {}),
          ...(department && department !== 'all' ? { department } : {}),
          ...(!isUnrestricted ? { companyId: currentUser.companyId } : {}),
        },
      },
    })

    const [attendance, bkoCount, scheduledEmployees, approvedLeaves] = await Promise.all([
      attendancePromise,
      bkoPromise,
      scheduledEmployeesPromise,
      approvedLeavesPromise,
    ])

    const leaveKeys = new Set(
      approvedLeaves.flatMap((leave) => {
        const start = new Date(leave.startDate)
        const end = new Date(leave.endDate)
        return scheduledEmployees
          .filter((schedule) => schedule.employeeId === leave.userId)
          .filter((schedule) => {
            const scheduleDate = new Date(schedule.scheduleDate)
            return scheduleDate >= start && scheduleDate <= end
          })
          .map((schedule) => `${schedule.employeeId}:${new Date(schedule.scheduleDate).toISOString().slice(0, 10)}`)
      }),
    )

    const scheduledKeys = new Set(
      scheduledEmployees.map((schedule) => `${schedule.employeeId}:${new Date(schedule.scheduleDate).toISOString().slice(0, 10)}`),
    )
    const dayOff = 0
    const onLeave = leaveKeys.size
    const totalEmployees = scheduledKeys.size
    const expectedToWork = Math.max(totalEmployees - onLeave, 0)

    // Calculate stats using the shared canonical tally (single source of truth)
    const tally = tallyAttendance(attendance)
    const presentToday = tally.present
    const lateCheckIns = tally.late
    const absentToday = tally.absent
    const notCheckedIn = tally.notCheckedIn
    const averageLateMinutes = tally.averageLateMinutes
    const attendanceRate = computeAttendanceRate(presentToday, lateCheckIns, expectedToWork)

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
