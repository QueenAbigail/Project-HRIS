import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { NextRequest, NextResponse } from 'next/server'

async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}

const TIMEZONES = new Set(['WIB', 'WITA', 'WIT'])

function validateLocationInput(input: {
  name?: unknown
  latitude?: unknown
  longitude?: unknown
  radius?: unknown
  timezone?: unknown
}) {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const latitude = typeof input.latitude === 'number' ? input.latitude : Number(input.latitude)
  const longitude = typeof input.longitude === 'number' ? input.longitude : Number(input.longitude)
  const radius = typeof input.radius === 'number' ? input.radius : Number(input.radius)

  if (!name || name.length > 120) return 'A valid location name is required'
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return 'Latitude must be between -90 and 90'
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return 'Longitude must be between -180 and 180'
  if (!Number.isFinite(radius) || !Number.isInteger(radius) || radius < 1 || radius > 100000) return 'Radius must be a whole number between 1 and 100000'
  if (typeof input.timezone !== 'string' || !TIMEZONES.has(input.timezone)) return 'Timezone must be WIB, WITA, or WIT'

  return { name, latitude, longitude, radius, timezone: input.timezone }
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
    const input = await req.json()
    const { id: siteId } = await params
    const validated = validateLocationInput(input)

    if (typeof validated === 'string') {
      return NextResponse.json({ error: validated }, { status: 400 })
    }

    const location = await prisma.patrolLocation.create({
      data: {
        siteId,
        ...validated,
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
    const input = await req.json()
    const { locationId, isActive } = input
    const validated = validateLocationInput(input)

    if (!locationId || typeof validated === 'string') {
      return NextResponse.json(
        { error: typeof validated === 'string' ? validated : 'Location ID is required' },
        { status: 400 }
      )
    }

    const location = await prisma.patrolLocation.update({
      where: { id: locationId, siteId },
      data: {
        ...validated,
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
