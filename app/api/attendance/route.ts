import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { resolveAttendanceStatus } from '@/lib/attendance-utils'
import { getBusinessDate, getBusinessDateRange, getBusinessDateRangeForPreset } from '@/lib/timezone'

// Helper function to calculate attendance status based on check-in time and scheduled time
function calculateAttendanceStatus(actualCheckIn: string | null, scheduledStart: string | null): string {
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
      : new Date(actualCheckIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

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
}

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
    const date = searchParams.get('date') || getBusinessDate()
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(Number.parseInt(searchParams.get('pageSize') || '25', 10) || 25, 10), 50)

    // Build every range from calendar dates in Asia/Jakarta, then map them to UTC.
    let dateStart: Date
    let dateEnd: Date

    if (dateRange === 'custom') {
      const customRange = getBusinessDateRange(dateFrom || date, dateTo || dateFrom || date)
      dateStart = customRange.from
      dateEnd = customRange.to
    } else {
      const presetRange = getBusinessDateRangeForPreset(dateRange, getBusinessDate())
      const presetDates = getBusinessDateRange(presetRange.dateFrom, presetRange.dateTo)
      dateStart = presetDates.from
      dateEnd = presetDates.to
    }

    // Build where clause - use gte for start and lte for end to match date-only comparison
    const where: any = {
      date: {
        gte: dateStart,
        lte: dateEnd
      }
    }
    
    if (siteId && siteId !== 'all') {
      const requestedSite = await prisma.site.findUnique({
        where: { id: siteId },
        select: { id: true, companyId: true },
      })
      if (!requestedSite) {
        return NextResponse.json({ error: 'Site not found' }, { status: 404 })
      }
      if (isClient && requestedSite.companyId !== currentUser?.companyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      where.locationId = siteId
    } else if (isClient) {
      where.location = {
        company: {
          id: currentUser?.companyId
        }
      }
    }

    if (department && department !== 'all') {
      where.user = {
        department: department
      }
    }

    const [totalRecords, filtered] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.findMany({
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
          }
        },
        shift: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
            company: {
              select: {
                name: true
              }
            }
          }
        } as any
      },
      orderBy: [
        { date: 'desc' },
        { actualCheckIn: 'desc' },
        { id: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    ])

    // Resolve display status via the shared single-source-of-truth helper:
    // derive PRESENT/LATE from the check-in, but trust the persisted ABSENT/LEAVE
    // status that the auto-absent cron maintains (never downgrade ABSENT to Pending).
    const enrichedRecords = filtered.map((record: any) => ({
      ...record,
      status: resolveAttendanceStatus(record)
    }))

    return NextResponse.json({
      records: enrichedRecords,
      pagination: {
        page,
        pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize),
      },
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
      select: { id: true, companyId: true },
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

    const dateOnly = getBusinessDateRange(getBusinessDate(), getBusinessDate()).from

    // Check if attendance record already exists for today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        }
      }
    })

    // Calculate proper status based on check-in time and scheduled time
    const calculatedStatus = actualCheckIn 
      ? calculateAttendanceStatus(actualCheckIn, scheduledStart)
      : (status || 'NOT_CHECKED_IN')

    if (existingAttendance) {
      // Update existing record with proper status calculation
      const updateData: any = {
        lateMinutes,
        gpsLng,
        gpsLat,
        notes,
      }

      if (!existingAttendance.locationId) {
        updateData.locationId = resolvedLocationId
      }

      // If actualCheckIn is provided, update check-in and recalculate status
      if (actualCheckIn && !existingAttendance.actualCheckIn) {
        updateData.actualCheckIn = actualCheckIn
        updateData.status = calculateAttendanceStatus(actualCheckIn, scheduledStart || existingAttendance.scheduledStart)
        updateData.selfieCheckIn = selfieCheckIn
      }

      // If actualCheckOut is provided, update check-out and ensure status is properly set
      if (actualCheckOut) {
        updateData.actualCheckOut = actualCheckOut
        updateData.selfieCheckOut = selfieCheckOut
        
        // Ensure status is set based on check-in time (if it wasn't already)
        if (!updateData.status && existingAttendance.actualCheckIn) {
          updateData.status = calculateAttendanceStatus(
            existingAttendance.actualCheckIn, 
            scheduledStart || existingAttendance.scheduledStart
          )
        }
      }

      // If no status was set during check-in or check-out, calculate it now
      if (!updateData.status && existingAttendance.actualCheckIn) {
        updateData.status = calculateAttendanceStatus(
          existingAttendance.actualCheckIn,
          scheduledStart || existingAttendance.scheduledStart
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
        actualCheckIn,
        actualCheckOut: actualCheckOut || null,
        status: calculatedStatus,
        lateMinutes: lateMinutes || 0,
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
