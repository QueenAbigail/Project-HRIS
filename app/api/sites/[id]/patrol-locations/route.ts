import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { NextRequest, NextResponse } from 'next/server'

async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { id: siteId } = await params

    const locations = await prisma.patrolLocation.findMany({
      where: { siteId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        radius: true,
        timezone: true,
        isActive: true,
      },
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching patrol locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patrol locations' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { name, latitude, longitude, radius, timezone } = await req.json()
    const { id: siteId } = await params

    if (!name?.trim() || !latitude || !longitude || !radius || !timezone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const location = await prisma.patrolLocation.create({
      data: {
        siteId,
        name: name.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
        timezone,
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        radius: true,
        timezone: true,
        isActive: true,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error creating patrol location:', error)
    return NextResponse.json(
      { error: 'Failed to create patrol location' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { id: siteId } = await params
    const { locationId, name, latitude, longitude, radius, timezone, isActive } = await req.json()

    if (!locationId || !name?.trim() || latitude === undefined || longitude === undefined || !radius || !timezone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const location = await prisma.patrolLocation.update({
      where: { id: locationId, siteId },
      data: {
        name: name.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
        timezone,
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        radius: true,
        timezone: true,
        isActive: true,
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error updating patrol location:', error)
    return NextResponse.json(
      { error: 'Failed to update patrol location' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { id: siteId } = await params
    const { searchParams } = new URL(req.url)
    const locationId = searchParams.get('locationId')

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    await prisma.patrolLocation.delete({
      where: { id: locationId, siteId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting patrol location:', error)
    return NextResponse.json(
      { error: 'Failed to delete patrol location' },
      { status: 500 }
    )
  }
}
