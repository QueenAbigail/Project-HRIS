import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const leave = await prisma.leave.update({
      where: { id: params.id },
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
