import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400 }
      )
    }

    console.log("[v0] Fetching patrol locations for siteId:", siteId)

    // Fetch patrol locations for the site
    const patrolLocations = await prisma.patrolLocation.findMany({
      where: { siteId },
      select: {
        id: true,
        name: true,
        code: true,
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
    console.error('Error fetching patrol locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patrol locations' },
      { status: 500 }
    )
  }
}
