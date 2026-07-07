import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const siteId = searchParams.get('siteId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    // Get attendance records for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        ...(siteId && siteId !== 'all' ? { locationId: siteId } : {}),
      },
      select: {
        date: true,
        status: true,
        lateMinutes: true,
        userId: true,
      },
    })

    // Group by date to calculate attendance status for each day
    const attendanceByDate = new Map<string, Array<{ status: string; lateMinutes: number }>>()

    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split('T')[0].replace(/-/g, '')
      if (!attendanceByDate.has(dateKey)) {
        attendanceByDate.set(dateKey, [])
      }
      attendanceByDate.get(dateKey)!.push({
        status: record.status,
        lateMinutes: record.lateMinutes || 0,
      })
    })

    // Calculate attendance status for each day
    const fullAttendanceDates: string[] = []
    const partialDates: string[] = []
    const lowAttendanceDates: string[] = []

    attendanceByDate.forEach((records, dateKey) => {
      if (records.length === 0) return

      // Count records by status
      const presentCount = records.filter((r) => r.status === 'PRESENT').length
      const absentCount = records.filter((r) => r.status === 'NOT_CHECKED_IN' || r.status === 'ABSENT').length
      const totalCount = records.length

      // Calculate percentage
      const presentPercentage = (presentCount / totalCount) * 100

      // Determine day status based on attendance percentage
      if (presentPercentage === 100) {
        fullAttendanceDates.push(dateKey)
      } else if (presentPercentage >= 50) {
        partialDates.push(dateKey)
      } else {
        lowAttendanceDates.push(dateKey)
      }
    })

    return NextResponse.json({
      fullAttendance: fullAttendanceDates.length,
      partial: partialDates.length,
      lowAttendance: lowAttendanceDates.length,
      datesByStatus: {
        fullAttendance: fullAttendanceDates,
        partial: partialDates,
        lowAttendance: lowAttendanceDates,
      },
    })
  } catch (error) {
    console.error('[v0] Calendar stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar statistics' },
      { status: 500 }
    )
  }
}
