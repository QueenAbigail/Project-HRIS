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

// GET all companies with their sites
export async function GET() {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    console.log('[v0] Fetching companies from database...')
    const companies = await prisma.company.findMany({
      include: {
        sites: {
          select: {
            id: true,
            name: true,
            code: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
    console.log('[v0] Fetched companies:', companies.length)
    return NextResponse.json(companies)
  } catch (error) {
    console.error('[v0] Error fetching companies:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to fetch companies', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST create new company
export async function POST(req: NextRequest) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { name } = await req.json()
    const companyName = typeof name === 'string' ? name.trim() : ''

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    if (companyName.length > 100) {
      return NextResponse.json(
        { error: 'Company name must be 100 characters or fewer' },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: { name: companyName },
      include: {
        sites: {
          select: {
            id: true,
            name: true,
            code: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error: any) {
    console.error('Error creating company:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Company already exists',
          code: 'COMPANY_NAME_EXISTS',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

// PUT update company
export async function PUT(req: NextRequest) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { id, name } = await req.json()
    const companyName = typeof name === 'string' ? name.trim() : ''

    if (!id || !companyName) {
      return NextResponse.json(
        { error: 'Company ID and name are required' },
        { status: 400 }
      )
    }

    if (companyName.length > 100) {
      return NextResponse.json(
        { error: 'Company name must be 100 characters or fewer' },
        { status: 400 }
      )
    }

    const company = await prisma.company.update({
      where: { id },
      data: { name: companyName },
      include: {
        sites: {
          select: {
            id: true,
            name: true,
            code: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

// DELETE company
export async function DELETE(req: NextRequest) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
