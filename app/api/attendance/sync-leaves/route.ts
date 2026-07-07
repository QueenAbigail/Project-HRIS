import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Syncs approved leaves with attendance records
 * Updates pending attendance records to LEAVE status if approved leave exists
 * This endpoint is called after a leave is approved
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leaveId } = body

    if (!leaveId) {
      return NextResponse.json(
        { error: 'Missing leaveId' },
        { status: 400 }
      )
    }

    // Get the approved leave
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    })

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave not found' },
        { status: 404 }
      )
    }

    if (leave.status !== 'Approved') {
      return NextResponse.json(
        { error: 'Leave is not approved' },
        { status: 400 }
      )
    }

    // Find all attendance records for this user within the leave date range
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: leave.userId,
        date: {
          gte: leave.startDate,
          lte: leave.endDate,
        },
        // Only update pending records (NOT_CHECKED_IN, ABSENT, or PRESENT without times)
        status: {
          in: ['NOT_CHECKED_IN', 'ABSENT'],
        },
      },
    })

    // Update all matching attendance records to LEAVE status
    const updatePromises = attendanceRecords.map((attendance) =>
      prisma.attendance.update({
        where: { id: attendance.id },
        data: { status: 'LEAVE' },
      })
    )

    const updatedRecords = await Promise.all(updatePromises)

    console.log(`[v0] Synced ${updatedRecords.length} attendance records to LEAVE for user ${leave.userId}`)

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedRecords.length} attendance records to LEAVE status`,
      updatedCount: updatedRecords.length,
      leaveId,
    })
  } catch (error) {
    console.error('[v0] Error syncing leaves to attendance:', error)
    return NextResponse.json(
      { error: 'Failed to sync leaves to attendance' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check if a user has approved leaves for a given date range
 * Returns information about leaves that overlap with the date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, startDate, endDate' },
        { status: 400 }
      )
    }

    // Find approved leaves for this user in the date range
    const approvedLeaves = await prisma.leave.findMany({
      where: {
        userId,
        status: 'Approved',
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) },
      },
    })

    return NextResponse.json({
      userId,
      approvedLeavesCount: approvedLeaves.length,
      leaves: approvedLeaves,
    })
  } catch (error) {
    console.error('[v0] Error fetching leave info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave information' },
      { status: 500 }
    )
  }
}
