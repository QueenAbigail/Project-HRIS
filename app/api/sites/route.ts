import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/system'

export async function GET(request: NextRequest) {
  try {
    // Get current user to check if CLIENT role
    const currentUser = await getCurrentUser()
    const isClient = currentUser?.role === 'CLIENT'
    
    const sites = await prisma.site.findMany({
      where: isClient ? { companyId: currentUser?.companyId } : undefined,
      select: {
        id: true,
        name: true,
        code: true,
        companyId: true,
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(sites)
  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    )
  }
}
