import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.overtimeRule.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting overtime rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete overtime rule' },
      { status: 500 }
    )
  }
}
