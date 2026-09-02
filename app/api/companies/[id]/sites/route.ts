import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { NextRequest, NextResponse } from 'next/server'

async function requireSuperAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}

// POST create new site for a company
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

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
        companyId,
        ...(latitude !== null && latitude !== undefined && { latitude: String(latitude) }),
        ...(longitude !== null && longitude !== undefined && { longitude: String(longitude) }),
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
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { siteId, name, code, latitude, longitude } = await req.json()

    if (!siteId || !name || !name.trim() || !code || !code.trim()) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const site = await prisma.site.update({
      where: { id: siteId },
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        ...(latitude !== null && latitude !== undefined && { latitude: String(latitude) }),
        ...(longitude !== null && longitude !== undefined && { longitude: String(longitude) }),
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
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

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
