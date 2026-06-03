import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay } from 'date-fns'

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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}
    
    if (siteId && siteId !== 'all') {
      where.locationId = siteId
    }

    if (date) {
      const dateObj = new Date(date)
      where.date = {
        gte: startOfDay(dateObj),
        lte: endOfDay(dateObj),
      }
    }

    if (userId) {
      where.userId = userId
    }

    if (status) {
      where.status = status
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
          }
        },
        location: {
          select: {
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

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
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
