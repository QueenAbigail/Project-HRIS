import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManageLeaves } from '@/lib/leave-authorization'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!canManageLeaves(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body // "Approved" or "Rejected"

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const swap = await prisma.shiftSwap.update({
      where: { id: params.id },
      data: { status },
      include: {
        employeeFrom: { select: { id: true, name: true, employeeCode: true, department: true } },
        employeeTo: { select: { id: true, name: true, employeeCode: true, department: true } },
        site: { select: { id: true, name: true } },
      },
    })

    console.log(`[v0] Shift swap ${params.id} ${status}`)

    return NextResponse.json({ success: true, swap })
  } catch (error) {
    console.error('[v0] Error updating shift swap:', error)
    return NextResponse.json(
      { error: 'Failed to update shift swap', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
