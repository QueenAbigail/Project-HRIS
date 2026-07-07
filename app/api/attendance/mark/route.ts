import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

interface MarkAttendanceRequest {
  userId: string
  date: string // YYYY-MM-DD
  locationId: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'NOT_CHECKED_IN'
  checkInTime?: string // HH:MM
  checkOutTime?: string // HH:MM
  notes?: string
  lateMinutes?: number
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: MarkAttendanceRequest = await request.json()

    // Validate required fields
    if (!body.userId || !body.date || !body.locationId || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, date, locationId, status' },
        { status: 400 }
      )
    }

    // Parse date
    const attendanceDate = new Date(body.date)
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Parse times if provided
    let actualCheckIn: Date | null = null
    let actualCheckOut: Date | null = null

    if (body.checkInTime) {
      const [hours, minutes] = body.checkInTime.split(':').map(Number)
      actualCheckIn = new Date(attendanceDate)
      actualCheckIn.setHours(hours, minutes, 0, 0)
    }

    if (body.checkOutTime) {
      const [hours, minutes] = body.checkOutTime.split(':').map(Number)
      actualCheckOut = new Date(attendanceDate)
      actualCheckOut.setHours(hours, minutes, 0, 0)
    }

    // Check if attendance record already exists for this user and date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: body.userId,
          date: attendanceDate,
        },
      },
    })

    let result

    if (existingAttendance) {
      // Update existing record
      result = await prisma.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          locationId: body.locationId,
          status: body.status,
          actualCheckIn,
          actualCheckOut,
          lateMinutes: body.lateMinutes || 0,
          notes: body.notes || null,
        },
      })
    } else {
      // Create new record
      result = await prisma.attendance.create({
        data: {
          userId: body.userId,
          date: attendanceDate,
          locationId: body.locationId,
          status: body.status,
          actualCheckIn,
          actualCheckOut,
          lateMinutes: body.lateMinutes || 0,
          notes: body.notes || null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: existingAttendance ? 'Attendance updated' : 'Attendance created',
      data: result,
    })
  } catch (error) {
    console.error('[v0] Failed to mark attendance:', error)
    return NextResponse.json(
      { error: 'Failed to save attendance record' },
      { status: 500 }
    )
  }
}
