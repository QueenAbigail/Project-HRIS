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
    interface DailyStats {
      present: number
      late: number
      absent: number
      total: number
    }

    const attendanceByDate = new Map<string, Array<{ status: string; lateMinutes: number }>>()

    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split('T')[0]
      if (!attendanceByDate.has(dateKey)) {
        attendanceByDate.set(dateKey, [])
      }
      attendanceByDate.get(dateKey)!.push({
        status: record.status,
        lateMinutes: record.lateMinutes || 0,
      })
    })

    // Calculate detailed stats for each day
    interface DateDetail {
      date: string
      present: number
      late: number
      absent: number
      total: number
      attendancePercentage: number
      latePercentage: number
      absentPercentage: number
      status: 'fullAttendance' | 'partial' | 'lowAttendance'
    }

    const dailyDetails: Record<string, DateDetail> = {}
    const fullAttendanceDates: string[] = []
    const partialDates: string[] = []
    const lowAttendanceDates: string[] = []

    attendanceByDate.forEach((records, dateKey) => {
      if (records.length === 0) return

      // Count records by status
      const presentCount = records.filter((r) => r.status === 'PRESENT').length
      const lateCount = records.filter((r) => r.status === 'LATE' && r.lateMinutes! > 0).length
      const absentCount = records.filter((r) => r.status === 'NOT_CHECKED_IN' || r.status === 'ABSENT').length
      const totalCount = records.length

      // Calculate percentages
      const attendancePercentage = Math.round(((presentCount + lateCount) / totalCount) * 100)
      const latePercentage = Math.round((lateCount / totalCount) * 100)
      const absentPercentage = Math.round((absentCount / totalCount) * 100)

      // Determine day status based on attendance percentage
      let dayStatus: 'fullAttendance' | 'partial' | 'lowAttendance'
      if (attendancePercentage >= 90) {
        dayStatus = 'fullAttendance'
        fullAttendanceDates.push(dateKey)
      } else if (attendancePercentage >= 50) {
        dayStatus = 'partial'
        partialDates.push(dateKey)
      } else {
        dayStatus = 'lowAttendance'
        lowAttendanceDates.push(dateKey)
      }

      dailyDetails[dateKey] = {
        date: dateKey,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        total: totalCount,
        attendancePercentage,
        latePercentage,
        absentPercentage,
        status: dayStatus,
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
      dailyDetails,
    })
  } catch (error) {
    console.error('[v0] Calendar stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar statistics' },
      { status: 500 }
    )
  }
}
