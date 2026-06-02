import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET patrol locations by site
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    console.error('[v0] Error fetching patrol locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patrol locations' },
      { status: 500 }
    )
  }
}

// POST create new patrol location
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, latitude, longitude, radius, timezone } = await req.json()
    const { id: siteId } = await params

    if (!name || !latitude || !longitude || !radius || !timezone) {
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
        isActive: true,
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
        longitude: true,
        radius: true,
        isActive: true,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating patrol location:', error)
    return NextResponse.json(
      { error: 'Failed to create patrol location' },
      { status: 500 }
    )
  }
}

// PUT update patrol location
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { locationId, name, latitude, longitude, radius, timezone, isActive } = await req.json()

    if (!locationId || !name || latitude === undefined || longitude === undefined || !radius || !timezone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const location = await prisma.patrolLocation.update({
      where: { id: locationId },
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
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        radius: true,
        isActive: true,
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error('[v0] Error updating patrol location:', error)
    return NextResponse.json(
      { error: 'Failed to update patrol location' },
      { status: 500 }
    )
  }
}

// DELETE patrol location
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url)
    const locationId = searchParams.get('locationId')

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    await prisma.patrolLocation.delete({
      where: { id: locationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting patrol location:', error)
    return NextResponse.json(
      { error: 'Failed to delete patrol location' },
      { status: 500 }
    )
  }
}
