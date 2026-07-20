import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST create new site for a company
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, code, latitude, longitude } = await req.json()
    const { id: companyId } = await params

    if (!name || !name.trim() || !code || !code.trim()) {
      return NextResponse.json(
        { error: 'Site name and code are required' },
        { status: 400 }
      )
    }

    const latitudeValue = latitude !== null && latitude !== undefined ? String(latitude) : null
    const longitudeValue = longitude !== null && longitude !== undefined ? String(longitude) : null

    const createData: any = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      companyId,
    }

    if (latitudeValue !== null) createData.latitude = latitudeValue
    if (longitudeValue !== null) createData.longitude = longitudeValue

    const site = await prisma.site.create({
      data: createData,
      select: {
        id: true,
        name: true,
        code: true,
        latitude: true,
        longitude: true,
      },
    })

    return NextResponse.json(site, { status: 201 })
  } catch (error: any) {
    console.error('Error creating site:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Site code already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    )
  }
}

// PUT update site
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { siteId, name, code, latitude, longitude } = await req.json()
    console.log('[v0-api-update] Request body:', { siteId, name, code, latitude, longitude })

    if (!siteId || !name || !name.trim() || !code || !code.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const latitudeValue = latitude !== null && latitude !== undefined ? String(latitude) : null
    const longitudeValue = longitude !== null && longitude !== undefined ? String(longitude) : null
    
    console.log('[v0-api-update] Converted values:', { latitudeValue, longitudeValue })

    // Build the update data object
    const updateData: any = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
    }
    
    // Only add coordinates if they have values
    if (latitudeValue !== null) updateData.latitude = latitudeValue
    if (longitudeValue !== null) updateData.longitude = longitudeValue

    console.log('[v0-api-update] Update data:', updateData)

    const site = await prisma.site.update({
      where: { id: siteId },
      data: updateData,
      select: {
        id: true,
        name: true,
        code: true,
        latitude: true,
        longitude: true,
      },
    })

    console.log('[v0-api-update] Site updated successfully:', site)
    return NextResponse.json(site)
  } catch (error: any) {
    console.error('[v0-api-update] Error:', error.message)
    console.error('[v0-api-update] Full error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Site code already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update site' },
      { status: 500 }
    )
  }
}

// DELETE site
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      )
    }

    await prisma.site.delete({
      where: { id: siteId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting site:', error)
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    )
  }
}
