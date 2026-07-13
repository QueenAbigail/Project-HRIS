import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/schedules/clear
 * Clear schedules by date range or all schedules
 * 
 * Query params:
 * - all: true - delete all schedules
 * - startDate: YYYY-MM-DD - delete from this date onwards
 * - endDate: YYYY-MM-DD - delete up to this date
 * - employeeId: clear only for this employee
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const clearAll = searchParams.get('all') === 'true'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const employeeId = searchParams.get('employeeId')

    if (!clearAll && !startDate && !endDate && !employeeId) {
      return NextResponse.json(
        { error: 'Provide either all=true or startDate/endDate or employeeId' },
        { status: 400 }
      )
    }

    let deleted = 0

    if (clearAll) {
      // Delete all schedules
      const result = await prisma.schedule.deleteMany({})
      deleted = result.count
      console.log('[v0] Cleared all schedules:', deleted)
    } else {
      // Delete by criteria
      const where: any = {}

      if (employeeId) {
        where.employeeId = employeeId
      }

      if (startDate || endDate) {
        where.scheduleDate = {}
        if (startDate) {
          where.scheduleDate.gte = new Date(startDate)
        }
        if (endDate) {
          where.scheduleDate.lte = new Date(endDate)
        }
      }

      const result = await prisma.schedule.deleteMany({ where })
      deleted = result.count
      console.log('[v0] Deleted schedules:', { deleted, criteria: { employeeId, startDate, endDate } })
    }

    return NextResponse.json({
      message: `Deleted ${deleted} schedule(s)`,
      deleted,
    })
  } catch (error) {
    console.error('[v0] Error clearing schedules:', error)
    return NextResponse.json(
      { error: 'Failed to clear schedules' },
      { status: 500 }
    )
  }
}
