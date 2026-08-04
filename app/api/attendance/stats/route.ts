import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { calculateAttendanceStatus } from '@/lib/attendance-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const siteId = searchParams.get('siteId')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Build where clause
    const where: any = {
      date: {
        gte: startOfDay(new Date(date)),
        lte: endOfDay(new Date(date)),
      }
    }
    
    if (siteId && siteId !== 'all') {
      where.locationId = siteId
    }

    // Get all attendance records for the day
    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: true,
        location: true,
      }
    })

    // Calculate stats
    let presentToday = 0
    let absentToday = 0
    let lateCheckIns = 0
    let onLeave = 0
    let dayOff = 0
    let totalLateMinutes = 0

    attendance.forEach((record) => {
      // Recalculate status based on check-in time and scheduled time
      const status = calculateAttendanceStatus(record.actualCheckIn, record.shift?.startTime || record.scheduledStart)
      
      if (status === 'LATE') {
        lateCheckIns++
        presentToday++
        totalLateMinutes += record.lateMinutes || 0
      } else if (status === 'PRESENT') {
        presentToday++
      } else if (status === 'ABSENT') {
        absentToday++
      } else if (status === 'LEAVE') {
        onLeave++
      } else if (status === 'DAY_OFF') {
        dayOff++
      } else if (status === 'NOT_CHECKED_IN') {
        absentToday++
      }
    })

    const totalEmployees = attendance.length || 1 // Prevent division by zero
    const expectedToWork = totalEmployees - dayOff
    const attendanceRate = expectedToWork > 0 ? Math.round((presentToday / expectedToWork) * 100) : 100
    const averageLateMinutes = lateCheckIns > 0 ? Math.round(totalLateMinutes / lateCheckIns) : 0

    // Count BKO assignments (if BKO table exists)
    let bkoCount = 0
    try {
      const bkoAssignments = await prisma.bko.findMany({
        where: {
          date: {
            gte: startOfDay(new Date(date)),
            lte: endOfDay(new Date(date)),
          },
          ...(siteId && siteId !== 'all' ? { backupEmployee: { siteId } } : {})
        }
      })
      bkoCount = bkoAssignments.length
    } catch {
      // BKO table may not exist yet
      bkoCount = 0
    }

    return NextResponse.json({
      presentToday,
      absentToday,
      lateCheckIns,
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
