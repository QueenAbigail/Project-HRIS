import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { calculateAttendanceStatus, calculateLateMinutes, resolveAttendanceStatus } from '@/lib/attendance-utils'
import { getBusinessDate, getBusinessDateRange, getBusinessDateRangeForPreset, type SiteTimezone } from '@/lib/timezone'
import { parseUtcTimestamp } from '@/lib/attendance-timestamps'

/* legacy helper removed; shared calculator is authoritative */
/* function calculateAttendanceStatus(actualCheckIn: string | null, scheduledStart: string | null, timezone: SiteTimezone | string = 'WIB'): string {
  if (!actualCheckIn) {
    return 'NOT_CHECKED_IN'
  }

  if (!scheduledStart) {
    // If no scheduled start time, mark as PRESENT
    return 'PRESENT'
  }

  try {
    // Parse check-in time (format: "HH:MM" or ISO timestamp)
    const checkInTime = actualCheckIn.includes(':') && !actualCheckIn.includes('T')
      ? actualCheckIn
      : new Date(actualCheckIn).toLocaleTimeString('en-GB', {
          timeZone: timezone === 'WITA' ? 'Asia/Makassar' : timezone === 'WIT' ? 'Asia/Jayapura' : 'Asia/Jakarta',
          hour: '2-digit', minute: '2-digit', hour12: false,
        })

    const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number)
    const checkInTotalMinutes = checkInHour * 60 + checkInMinute

    // Parse scheduled start time
    const scheduleTime = scheduledStart.includes(':') && !scheduledStart.includes('T')
      ? scheduledStart
      : new Date(scheduledStart).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

    const [scheduleHour, scheduleMinute] = scheduleTime.split(':').map(Number)
    const scheduleTotalMinutes = scheduleHour * 60 + scheduleMinute

    // If check-in time is after scheduled time, mark as LATE
    if (checkInTotalMinutes > scheduleTotalMinutes) {
      return 'LATE'
    }

    // Otherwise, mark as PRESENT
    return 'PRESENT'
  } catch (error) {
    console.error('[v0] Error calculating attendance status:', error)
    return 'PRESENT' // Default to PRESENT on error
  }
} */

interface AttendanceQuery {
  siteId?: string
  date?: string
  userId?: string
  status?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get current user to check if CLIENT role
    const currentUser = await getCurrentUser()
    const isClient = currentUser?.role === 'CLIENT'
    
    const siteId = searchParams.get('siteId')
    const dateRange = searchParams.get('dateRange') || 'today'
    const department = searchParams.get('department')
    const employeeName = searchParams.get('employeeName')?.trim()
    const date = searchParams.get('date') || getBusinessDate()
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(Number.parseInt(searchParams.get('pageSize') || '25', 10) || 25, 10), 50)

    // view=rows returns only the requested page, view=counts returns only totals,
    // and the default returns both for backwards-compatible callers.
    const requestedView = searchParams.get('view')
    const view = requestedView === 'rows' || requestedView === 'counts' ? requestedView : 'all'

    const requestedSite = siteId && siteId !== 'all'
      ? await prisma.site.findUnique({ where: { id: siteId }, select: { id: true, companyId: true, timezone: true } })
      : null
    if (siteId && siteId !== 'all') {
      if (!requestedSite) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
      }
      if (isClient && requestedSite.companyId !== currentUser?.companyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Attendance.date stores the site's local calendar date as a date-only UTC value.
    // Presets resolve one calendar range per timezone so Today/Yesterday stay correct
    // when WIB, WITA, and WIT sites are reported together. Sites sharing a range are
    // grouped so the database receives one indexable condition per distinct range.
    let dateWhere: any
    if (dateRange === 'custom') {
      const customRange = getBusinessDateRange(dateFrom || date, dateTo || dateFrom || date)
      dateWhere = { date: { gte: customRange.from, lte: customRange.to } }
    } else {
      const sites = requestedSite
        ? [requestedSite]
        : await prisma.site.findMany({
            where: isClient ? { companyId: currentUser?.companyId || undefined } : undefined,
            select: { id: true, timezone: true },
          })
      const rangeGroups = new Map<string, { from: Date; to: Date; siteIds: string[] }>()
      for (const site of sites) {
        const presetRange = getBusinessDateRangeForPreset(dateRange, getBusinessDate(new Date(), site.timezone))
        const range = getBusinessDateRange(presetRange.dateFrom, presetRange.dateTo)
        const key = `${range.from.toISOString()}|${range.to.toISOString()}`
        const group = rangeGroups.get(key) || { from: range.from, to: range.to, siteIds: [] }
        group.siteIds.push(site.id)
        rangeGroups.set(key, group)
      }
      const groups = [...rangeGroups.values()]
      if (groups.length === 0) {
        const fallback = getBusinessDateRangeForPreset(dateRange, getBusinessDate())
        const range = getBusinessDateRange(fallback.dateFrom, fallback.dateTo)
        dateWhere = { date: { gte: range.from, lte: range.to } }
      } else if (groups.length === 1) {
        dateWhere = { date: { gte: groups[0].from, lte: groups[0].to } }
      } else {
        dateWhere = {
          OR: groups.map(({ from, to, siteIds }) => ({ locationId: { in: siteIds }, date: { gte: from, lte: to } })),
        }
      }
    }

    const filters: any[] = [dateWhere]
    if (requestedSite) {
      filters.push({ locationId: requestedSite.id })
    } else if (isClient) {
      filters.push({ location: { companyId: currentUser?.companyId } })
    }
    if (department && department !== 'all') {
      filters.push({ user: { department } })
    }
    if (employeeName) {
      filters.push({ user: { name: { contains: employeeName, mode: 'insensitive' } } })
    }
    const where = { AND: filters }

    const loadCounts = async () => {
      // Status is derived from (stored status, has check-in, lateMinutes > 0), so three
      // small grouped queries cover every combination without downloading rows.
      const partitions = [
        { where: { AND: [...filters, { actualCheckIn: null }] }, sample: { actualCheckIn: null, lateMinutes: 0 } },
        { where: { AND: [...filters, { actualCheckIn: { not: null } }, { lateMinutes: { gt: 0 } }] }, sample: { actualCheckIn: new Date(0), lateMinutes: 1 } },
        { where: { AND: [...filters, { actualCheckIn: { not: null } }, { lateMinutes: { lte: 0 } }] }, sample: { actualCheckIn: new Date(0), lateMinutes: 0 } },
      ]
      const grouped = await Promise.all(
        partitions.map((partition) =>
          (prisma.attendance.groupBy as any)({
            by: ['status'],
            where: partition.where,
            _count: { _all: true },
          }) as Promise<Array<{ status: string; _count: { _all: number } }>>
        )
      )
      const statusCounts: Record<string, number> = {}
      let totalRecords = 0
      grouped.forEach((groups, index) => {
        for (const group of groups) {
          const status = resolveAttendanceStatus({ ...partitions[index].sample, status: group.status })
          statusCounts[status] = (statusCounts[status] || 0) + group._count._all
          totalRecords += group._count._all
        }
      })
      return { statusCounts, totalRecords }
    }

    const loadRows = async () => {
      const rows = await prisma.attendance.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              initials: true,
              department: true,
              position: true,
              employeeCode: true,
            },
          },
          shift: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              code: true,
              timezone: true,
              company: { select: { name: true } },
            },
          } as any,
        },
        orderBy: [
          { date: 'desc' },
          { actualCheckIn: 'desc' },
          { id: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      })

      // Only look up BKO assignments for the employees and dates on this page.
      const userIds = [...new Set(rows.map((row: any) => row.userId as string))]
      const rowDates = rows.map((row: any) => new Date(row.date).getTime())
      const bkoAssignments = userIds.length
        ? await prisma.bkoAssignment.findMany({
            where: {
              status: 'Aktif',
              substituteId: { in: userIds },
              leave: {
                startDate: { lte: new Date(Math.max(...rowDates)) },
                endDate: { gte: new Date(Math.min(...rowDates)) },
              },
            },
            select: {
              substituteId: true,
              substitute: { select: { name: true } },
              leave: { select: { startDate: true, endDate: true, user: { select: { name: true } } } },
            },
          })
        : []
      const assignmentsByUser = new Map<string, typeof bkoAssignments>()
      for (const assignment of bkoAssignments) {
        const list = assignmentsByUser.get(assignment.substituteId) || []
        list.push(assignment)
        assignmentsByUser.set(assignment.substituteId, list)
      }

      return rows.map((record: any) => {
        const recordDate = new Date(record.date).toISOString().slice(0, 10)
        const bko = assignmentsByUser.get(record.userId)?.find((assignment) =>
          recordDate >= assignment.leave.startDate.toISOString().slice(0, 10) &&
          recordDate <= assignment.leave.endDate.toISOString().slice(0, 10)
        )

        return {
          ...record,
          status: resolveAttendanceStatus(record),
          isBko: Boolean(bko),
          bkoDetails: bko ? {
            substituteName: bko.substitute.name,
            coveredEmployeeName: bko.leave.user.name,
            startDate: bko.leave.startDate,
            endDate: bko.leave.endDate,
          } : null,
        }
      })
    }

    const [counts, records] = await Promise.all([
      view === 'rows' ? null : loadCounts(),
      view === 'counts' ? null : loadRows(),
    ])

    return NextResponse.json({
      ...(records ? { records } : {}),
      pagination: counts
        ? { page, pageSize, totalRecords: counts.totalRecords, totalPages: Math.ceil(counts.totalRecords / pageSize) }
        : { page, pageSize },
      ...(counts ? { statusCounts: counts.statusCounts, totalRecords: counts.totalRecords } : {}),
    })
  } catch (error) {
    console.error('[v0] Error fetching attendance:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'HR_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      userId,
      locationId,
      shiftId,
      scheduledStart,
      scheduledEnd,
      actualCheckIn,
      actualCheckOut,
      status,
      lateMinutes,
      gpsLat,
      gpsLng,
      selfieCheckIn,
      selfieCheckOut,
      notes
    } = body

    const parsedCheckIn = parseUtcTimestamp(actualCheckIn)
    const parsedCheckOut = parseUtcTimestamp(actualCheckOut)
    if ((actualCheckIn && !parsedCheckIn) || (actualCheckOut && !parsedCheckOut)) {
      return NextResponse.json(
        { error: 'Check-in and check-out timestamps must be valid ISO timestamps with an explicit timezone, such as 2026-09-21T06:20:00.000Z' },
        { status: 400 }
      )
    }

    // The employee's assigned site is authoritative. Mobile may send locationId,
    // but a missing value must never create an attendance row without a location.
    if (!userId) {
      return NextResponse.json({ error: 'Employee is required' }, { status: 400 })
    }

    const targetEmployee = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, siteId: true, status: true },
    })

    if (!targetEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    if (!targetEmployee.siteId) {
      return NextResponse.json({ error: 'This employee has no assigned location' }, { status: 400 })
    }

    const targetLocation = await prisma.site.findUnique({
      where: { id: targetEmployee.siteId },
      select: { id: true, companyId: true, timezone: true },
    })

    if (!targetLocation) {
      return NextResponse.json({ error: 'The employee assigned location no longer exists' }, { status: 404 })
    }

    if (locationId && locationId !== targetLocation.id) {
      return NextResponse.json({ error: 'The submitted location does not match the employee assigned location' }, { status: 400 })
    }

    const resolvedLocationId = targetLocation.id

    if (targetEmployee.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Attendance cannot be changed for an inactive employee' }, { status: 400 })
    }

    const hasCompanyAccess =
      currentUser.role === 'SUPER_ADMIN' ||
      (!!currentUser.companyId && currentUser.companyId === targetEmployee.companyId)
    const hasSiteAccess = targetEmployee.siteId === resolvedLocationId

    if (!hasCompanyAccess || !hasSiteAccess) {
      return NextResponse.json({ error: 'You do not have access to this employee or location' }, { status: 403 })
    }

    const siteTimezone = targetLocation.timezone
    const siteDate = getBusinessDate(new Date(), siteTimezone)
    const dateOnly = getBusinessDateRange(siteDate, siteDate).from

    // Check if attendance record already exists for today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        }
      }
    })

    const resolvedShiftId = shiftId || existingAttendance?.shiftId || null
    const shift = resolvedShiftId
      ? await prisma.shift.findUnique({ where: { id: resolvedShiftId }, select: { gracePeriodMinutes: true } })
      : null
    const resolvedScheduledStart = scheduledStart || existingAttendance?.scheduledStart || null
    const gracePeriodMinutes = shift?.gracePeriodMinutes ?? 0
    const calculatedStatus = actualCheckIn
      ? calculateAttendanceStatus(actualCheckIn, resolvedScheduledStart, siteTimezone, gracePeriodMinutes)
      : (status || 'NOT_CHECKED_IN')
    const calculatedLateMinutes = actualCheckIn
      ? calculateLateMinutes(actualCheckIn, resolvedScheduledStart, siteTimezone, gracePeriodMinutes)
      : 0

    if (existingAttendance) {
      // Update existing record with proper status calculation
      const updateData: any = {
        lateMinutes: actualCheckIn ? calculatedLateMinutes : existingAttendance.lateMinutes,
        gpsLng,
        gpsLat,
        notes,
      }

      if (!existingAttendance.locationId) {
        updateData.locationId = resolvedLocationId
      }

      // If actualCheckIn is provided, update check-in and recalculate status
      if (actualCheckIn && !existingAttendance.actualCheckIn) {
        updateData.actualCheckIn = parsedCheckIn
        updateData.status = calculateAttendanceStatus(actualCheckIn, resolvedScheduledStart, siteTimezone, gracePeriodMinutes)
        updateData.selfieCheckIn = selfieCheckIn
      }

      // If actualCheckOut is provided, update check-out and ensure status is properly set
      if (actualCheckOut) {
        updateData.actualCheckOut = parsedCheckOut
        updateData.selfieCheckOut = selfieCheckOut
        
        // Ensure status is set based on check-in time (if it wasn't already)
        if (!updateData.status && existingAttendance.actualCheckIn) {
          updateData.status = calculateAttendanceStatus(
            existingAttendance.actualCheckIn.toISOString(),
            resolvedScheduledStart,
            siteTimezone,
            gracePeriodMinutes
          )
        }
      }

      // If no status was set during check-in or check-out, calculate it now
      if (!updateData.status && existingAttendance.actualCheckIn) {
        updateData.status = calculateAttendanceStatus(
          existingAttendance.actualCheckIn.toISOString(),
          resolvedScheduledStart,
          siteTimezone,
          gracePeriodMinutes
        )
      }

      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: updateData,
        include: {
          user: true,
          location: true,
        }
      })

      console.log('[v0] Updated attendance record:', {
        userId,
        date: dateOnly,
        previousStatus: existingAttendance.status,
        newStatus: updated.status,
        checkInTime: updated.actualCheckIn
      })

      return NextResponse.json(updated)
    }

    // Create new record with calculated status
    const newAttendance = await prisma.attendance.create({
      data: {
        userId,
        locationId: resolvedLocationId,
        shiftId: shiftId || null,
        date: dateOnly,
        scheduledStart,
        scheduledEnd,
        actualCheckIn: parsedCheckIn,
        actualCheckOut: parsedCheckOut,
        status: calculatedStatus,
        lateMinutes: calculatedLateMinutes,
        gpsLat: gpsLat || null,
        gpsLng: gpsLng || null,
        selfieCheckIn,
        selfieCheckOut: selfieCheckOut || null,
        notes,
      },
      include: {
        user: true,
        location: true,
      }
    })

    console.log('[v0] Created attendance record:', {
      userId,
      date: dateOnly,
      status: newAttendance.status,
      checkInTime: newAttendance.actualCheckIn
    })

    return NextResponse.json(newAttendance)
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    )
  }
}
