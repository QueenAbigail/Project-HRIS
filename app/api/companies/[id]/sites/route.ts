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

    const site = await prisma.site.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        latitude: latitude !== null && latitude !== undefined ? String(latitude) : null,
        longitude: longitude !== null && longitude !== undefined ? String(longitude) : null,
        companyId,
      },
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

    if (!siteId || !name || !name.trim() || !code || !code.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const latitudeValue = latitude !== null && latitude !== undefined ? String(latitude) : null
    const longitudeValue = longitude !== null && longitude !== undefined ? String(longitude) : null

    const site = await prisma.site.update({
      where: { id: siteId },
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        latitude: latitudeValue,
        longitude: longitudeValue,
      },
      select: {
        id: true,
        name: true,
        code: true,
        latitude: true,
        longitude: true,
      },
    })

    return NextResponse.json(site)
  } catch (error: any) {
    console.error('Error updating site:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Site code already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update site' },
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
