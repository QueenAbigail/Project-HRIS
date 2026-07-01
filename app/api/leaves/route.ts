import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

export async function GET(request: NextRequest) {
  try {
    // Get current user to check if CLIENT role
    const currentUser = await getCurrentUser()
    const isClient = currentUser?.role === 'CLIENT'
    
    const leaves = await prisma.leave.findMany({
      where: isClient ? { user: { companyId: currentUser?.companyId } } : undefined,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(leaves)
  } catch (error) {
    console.error('[v0] Error fetching leaves:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaves' },
      { status: 500 }
    )
  }
}
