import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Admin cleanup endpoint - removes old schedules and pattern assignments
 * Call with: DELETE /api/admin/cleanup?type=all|schedules|patterns
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'

    let results: any = {}

    if (type === 'schedules' || type === 'all') {
      console.log('[v0] Clearing all schedules...')
      const deletedSchedules = await prisma.schedule.deleteMany({})
      results.schedules = {
        deleted: deletedSchedules.count,
        message: `Deleted ${deletedSchedules.count} schedules`,
      }
      console.log('[v0] Schedules deleted:', deletedSchedules.count)
    }

    if (type === 'patterns' || type === 'all') {
      console.log('[v0] Clearing all employee pattern assignments...')
      const deletedAssignments = await prisma.employeePatternAssignment.deleteMany({})
      results.patterns = {
        deleted: deletedAssignments.count,
        message: `Deleted ${deletedAssignments.count} pattern assignments`,
      }
      console.log('[v0] Pattern assignments deleted:', deletedAssignments.count)
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup complete for type: ${type}`,
      results,
    })
  } catch (error) {
    console.error('[v0] Cleanup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cleanup failed' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check what will be deleted
 */
export async function GET(req: NextRequest) {
  try {
    const scheduleCount = await prisma.schedule.count()
    const patternCount = await prisma.employeePatternAssignment.count()

    return NextResponse.json({
      schedules: {
        count: scheduleCount,
        message: `${scheduleCount} schedules exist`,
      },
      patterns: {
        count: patternCount,
        message: `${patternCount} pattern assignments exist`,
      },
      total: scheduleCount + patternCount,
    })
  } catch (error) {
    console.error('[v0] Cleanup check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Check failed' },
      { status: 500 }
    )
  }
}
