import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.deductionRule.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting deduction rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete deduction rule' },
      { status: 500 }
    )
  }
}
