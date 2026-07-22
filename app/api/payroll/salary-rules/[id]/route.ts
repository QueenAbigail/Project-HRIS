import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.salaryRule.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting salary rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete salary rule' },
      { status: 500 }
    )
  }
}
