import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400 }
      )
    }

    const canViewAllSites = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN'
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ...(canViewAllSites
          ? {}
          : currentUser.role === 'CLIENT'
            ? { companyId: currentUser.companyId }
            : { id: currentUser.siteId }),
      },
      select: { id: true },
    })

    if (!site) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const patrolLocations = await prisma.patrolLocation.findMany({
      where: { siteId: site.id },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        radius: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    })

    console.log("[v0] Found patrol locations:", patrolLocations.length)
    return NextResponse.json(patrolLocations)
  } catch (error) {
    console.error('[v0] Error fetching patrol locations:', error)
    if (error instanceof Error) {
      console.error('[v0] Error message:', error.message)
      console.error('[v0] Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: 'Failed to fetch patrol locations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
