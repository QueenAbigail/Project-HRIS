import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
        dateStart = startOfDay(subDays(now, 1))
        dateEnd = endOfDay(subDays(now, 1))
        break
      case 'week':
        dateStart = startOfDay(startOfWeek(now, { weekStartsOn: 0 })) // Sunday start
        dateEnd = endOfDay(endOfWeek(now, { weekStartsOn: 0 }))
        break
      case 'month':
        dateStart = startOfDay(startOfMonth(now))
        dateEnd = endOfDay(endOfMonth(now))
        break
      case 'custom':
        dateStart = startOfDay(new Date(date))
        dateEnd = endOfDay(new Date(date))
        break
      default:
        dateStart = startOfDay(now)
        dateEnd = endOfDay(now)
    }

    // Build where clause
    const where: any = {
      date: {
        gte: dateStart,
        lte: dateEnd,
      }
    }
    
    if (siteId && siteId !== 'all') {
      where.locationId = siteId
    }

    if (department && department !== 'all') {
      where.user = {
        department: department
      }
    }

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
        }
      },
      orderBy: {
        actualCheckIn: 'desc'
      }
    })

    // Transform to match frontend expectations
    const formatted = attendance.map((record) => {
      let status = record.status || 'NOT_CHECKED_IN'
      let workHours = '--'

      if (record.actualCheckIn && record.actualCheckOut) {
        const [inH, inM] = record.actualCheckIn.split(':').map(Number)
        const [outH, outM] = record.actualCheckOut.split(':').map(Number)
        const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        workHours = `${hours}h ${minutes.toString().padStart(2, '0')}m`
      }

      // Determine status based on check-in data
      if (!record.actualCheckIn) {
        status = 'not-checked-in'
      } else if (status === 'LATE') {
        status = 'late'
      } else if (status === 'PRESENT') {
        status = 'present'
      } else if (status === 'ABSENT') {
        status = 'absent'
      } else {
        status = 'not-checked-in'
      }

      return {
        id: record.id,
        employeeId: record.userId,
        employeeName: record.user.name,
        employeeCode: record.user.employeeCode,
        initials: record.user.initials,
        department: record.user.department || '',
        position: record.user.position || '',
        location: record.location.company?.name 
          ? `${record.location.company.name} - ${record.location.name}`
          : record.location.name,
        scheduledStart: record.shift?.startTime || record.scheduledStart || '--:--',
        scheduledEnd: record.shift?.endTime || record.scheduledEnd || '--:--',
        checkIn: record.actualCheckIn || null,
        checkOut: record.actualCheckOut || null,
        status: status as any,
        lateMinutes: record.lateMinutes || 0,
        workHours,
        checkInGps: record.gpsLat && record.gpsLng ? {
          latitude: record.gpsLat,
          longitude: record.gpsLng
        } : null,
        checkOutGps: null, // Would need to track check-out GPS separately
        checkInPhotoUrl: record.selfieCheckIn || null,
        checkOutPhotoUrl: record.selfieCheckOut || null,
      }
    })

    return NextResponse.json(formatted)
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
