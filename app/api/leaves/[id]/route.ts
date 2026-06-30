import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
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
    console.error('[v0] Error updating leave:', error)
    return NextResponse.json(
      { error: 'Failed to update leave' },
      { status: 500 }
    )
  }
}
