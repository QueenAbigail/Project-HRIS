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

    // If leave is approved, sync attendance records
    if (status === 'Approved') {
      try {
        console.log('[v0] Leave approved, syncing attendance records for user:', leave.userId)
        
        // Call the sync-leaves endpoint to update attendance records
        const syncResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/attendance/sync-leaves`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leaveId: id }),
          }
        )

        if (syncResponse.ok) {
          const syncResult = await syncResponse.json()
          console.log('[v0] Attendance sync result:', syncResult)
        } else {
          console.error('[v0] Failed to sync attendance records:', syncResponse.statusText)
        }
      } catch (syncError) {
        console.error('[v0] Error syncing attendance:', syncError)
        // Don't fail the leave approval if sync fails, just log it
      }
    }

    return NextResponse.json(leave)
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
