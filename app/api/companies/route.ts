import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all companies with their sites
export async function GET() {
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
  try {
    const { name } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Check if company already exists
    const existing = await prisma.company.findUnique({
      where: { name: name.trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Company already exists' },
        { status: 409 }
      )
    }

    const company = await prisma.company.create({
      data: { name: name.trim() },
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
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

// PUT update company
export async function PUT(req: NextRequest) {
  try {
    const { id, name } = await req.json()

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { error: 'Company ID and name are required' },
        { status: 400 }
      )
    }

    const company = await prisma.company.update({
      where: { id },
      data: { name: name.trim() },
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
