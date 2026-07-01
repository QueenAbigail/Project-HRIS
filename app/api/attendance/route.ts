import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

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
        dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'yesterday':
        const yesterday = subDays(now, 1)
        dateStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
        dateEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
        break
      case 'week':
        const weekStart = startOfWeek(now, { weekStartsOn: 0 }) // Sunday start
        const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
        dateStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
        dateEnd = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59)
        break
      case 'month':
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        dateStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate())
        dateEnd = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate(), 23, 59, 59)
        break
      case 'custom':
        const customDate = new Date(date)
        dateStart = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate())
        dateEnd = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate(), 23, 59, 59)
        break
      default:
        dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    }

    console.log("[v0] Attendance API - Date range:", { dateRange, dateStart, dateEnd })

    // Build where clause
    const where: any = {}
    
    if (siteId && siteId !== 'all') {
      where.locationId = siteId
    } else if (isClient) {
      // For CLIENT users, only show their company's locations
      where.location = {
        companyId: currentUser?.companyId
      }
    }

    if (department && department !== 'all') {
      where.user = {
        ...where.user,
        department: department
      }
    }

    console.log("[v0] Fetching attendance with where clause:", JSON.stringify(where))
    const attendance = await prisma.attendance.findMany({
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
      orderBy: {
        actualCheckIn: 'desc'
      }
    })

    // Filter by date range
    const filtered = attendance.filter(record => {
      const recordDate = new Date(record.date || new Date())
      return recordDate >= dateStart && recordDate <= dateEnd
    })

    console.log("[v0] Attendance API returning", filtered.length, "records for date range:", dateRange)
    return NextResponse.json(filtered)
  } catch (error) {
    console.error('[v0] Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
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

    if (existingAttendance) {
      // Update existing record
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          actualCheckOut,
          status,
          lateMinutes,
          gpsLng,
          gpsLat,
          selfieCheckOut,
          notes,
        },
        include: {
          user: true,
          location: true,
        }
      })
      return NextResponse.json(updated)
    }

    // Create new record
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
        status: status || 'CHECKED_IN',
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

    return NextResponse.json(newAttendance)
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    )
  }
}
