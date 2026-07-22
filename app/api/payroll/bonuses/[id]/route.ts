import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { status } = body

    const bonus = await prisma.payrollBonus.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: true,
        payrollPeriod: true,
      }
    })

    return NextResponse.json(bonus)
  } catch (error) {
    console.error('[v0] Error updating bonus:', error)
    return NextResponse.json(
      { error: 'Failed to update bonus' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.payrollBonus.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting bonus:', error)
    return NextResponse.json(
      { error: 'Failed to delete bonus' },
      { status: 500 }
    )
  }
}
