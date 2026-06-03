import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch all master data by category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const items = await prisma.masterData.findMany({
      where: {
        category: category,
        isActive: true,
      },
      orderBy: {
        value: 'asc',
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Failed to fetch master data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// POST - Create new master data entry
export async function POST(req: NextRequest) {
  try {
    const { category, value } = await req.json()

    if (!category || !value) {
      return NextResponse.json({ error: 'Category and value are required' }, { status: 400 })
    }

    // Check if already exists
    const existing = await prisma.masterData.findFirst({
      where: {
        category: category,
        value: value,
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Entry already exists' }, { status: 409 })
    }

    const newEntry = await prisma.masterData.create({
      data: {
        category,
        value,
        isActive: true,
      },
    })

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Failed to create master data:', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

// PUT - Update master data entry
export async function PUT(req: NextRequest) {
  try {
    const { id, value } = await req.json()

    if (!id || !value) {
      return NextResponse.json({ error: 'ID and value are required' }, { status: 400 })
    }

    const updated = await prisma.masterData.update({
      where: { id },
      data: { value },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update master data:', error)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

// DELETE - Delete master data entry
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.masterData.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete master data:', error)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
