import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canApprove = ['SUPER_ADMIN', 'HR_ADMIN'].includes(currentUser.role)
    if (!canApprove) {
      return NextResponse.json({ error: 'Only HR administrators can update leave status' }, { status: 403 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            department: true,
          }
        }
      }
    })

    // Sync the approval in the same server-side request. Calling another route
    // over HTTP here loses the current session context and depends on NEXTAUTH_URL.
    let syncedAttendanceCount = 0
    if (status === 'Approved') {
      const syncResult = await prisma.attendance.updateMany({
        where: {
          userId: leave.userId,
          date: { gte: leave.startDate, lte: leave.endDate },
          status: { in: ['NOT_CHECKED_IN', 'ABSENT'] },
        },
        data: { status: 'LEAVE' },
      })
      syncedAttendanceCount = syncResult.count
    }

    return NextResponse.json({ ...leave, syncedAttendanceCount })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[v0] Error updating leave:', errorMessage)
    console.error('[v0] Full error:', error)
    return NextResponse.json(
      { error: 'Failed to update leave', details: errorMessage },
      { status: 500 }
    )
  }
}
