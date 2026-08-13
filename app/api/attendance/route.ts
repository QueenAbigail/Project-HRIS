import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { resolveAttendanceStatus } from '@/lib/attendance-utils'

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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Calculate date range based on dateRange parameter
    let dateStart: Date
    let dateEnd: Date
    const now = new Date()

    switch (dateRange) {
      case 'today':
        dateStart = startOfDay(now)
        dateEnd = endOfDay(now)
        break
      case 'yesterday':
        const yesterday = subDays(now, 1)
        dateStart = startOfDay(yesterday)
        dateEnd = endOfDay(yesterday)
        break
      case 'week':
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday start
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        dateStart = startOfDay(weekStart)
        dateEnd = endOfDay(weekEnd)
        break
      case 'month':
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        dateStart = startOfDay(monthStart)
        dateEnd = endOfDay(monthEnd)
        break
      case 'custom':
        const customDate = new Date(date)
        dateStart = startOfDay(customDate)
        dateEnd = endOfDay(customDate)
        break
      default:
        dateStart = startOfDay(now)
        dateEnd = endOfDay(now)
    }

    console.log("[v0] Attendance API - Date range:", { dateRange, dateStart: dateStart.toISOString(), dateEnd: dateEnd.toISOString() })

    // Build where clause - use gte for start and lte for end to match date-only comparison
    const where: any = {
      date: {
        gte: dateStart,
        lte: dateEnd
      }
    }
    
    if (siteId && siteId !== 'all') {
      where.locationId = siteId
    } else if (isClient) {
      // For CLIENT users, only show their company's locations
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

    console.log("[v0] Fetching attendance with where clause:", JSON.stringify(where, null, 2))
    console.log("[v0] Current user:", { id: currentUser?.id, role: currentUser?.role, companyId: currentUser?.companyId })
    const filtered = await prisma.attendance.findMany({
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
        { actualCheckIn: 'desc' }
      ]
    })

    // Resolve display status via the shared single-source-of-truth helper:
    // derive PRESENT/LATE from the check-in, but trust the persisted ABSENT/LEAVE
    // status that the auto-absent cron maintains (never downgrade ABSENT to Pending).
    const enrichedRecords = filtered.map((record: any) => ({
      ...record,
      status: resolveAttendanceStatus(record)
    }))

    console.log("[v0] Attendance API returning", enrichedRecords.length, "records for date range:", dateRange)
    return NextResponse.json(enrichedRecords)
  } catch (error) {
    console.error('[v0] Error fetching attendance:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch attendance records', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!userId || !locationId) {
      return NextResponse.json(
        { error: 'userId and locationId are required' },
        { status: 400 }
      )
    }

    const date = new Date()
    const dateOnly = startOfDay(date)

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
        locationId,
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
