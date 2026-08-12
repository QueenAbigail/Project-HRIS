import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import { tallyAttendance, computeAttendanceRate } from '@/lib/attendance-utils'

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

    // Calculate stats using the shared canonical tally (single source of truth)
    const tally = tallyAttendance(attendance)
    const presentToday = tally.present
    const lateCheckIns = tally.late
    const absentToday = tally.absent
    const notCheckedIn = tally.notCheckedIn
    const onLeave = tally.onLeave
    const averageLateMinutes = tally.averageLateMinutes
    const dayOff = 0

    const totalEmployees = attendance.length || 1 // Prevent division by zero
    const expectedToWork = totalEmployees - dayOff
    const attendanceRate = computeAttendanceRate(presentToday, lateCheckIns, expectedToWork)

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
      notCheckedIn,
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
