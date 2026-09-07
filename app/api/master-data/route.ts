import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_CATEGORIES = new Set(['department', 'position', 'certificate'])
const MAX_VALUE_LENGTH = 100

async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}

function validateValue(value: unknown) {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''
  if (!normalizedValue) return { error: 'Value is required' }
  if (normalizedValue.length > MAX_VALUE_LENGTH) {
    return { error: `Value must be ${MAX_VALUE_LENGTH} characters or fewer` }
  }
  return { value: normalizedValue }
}

// GET - Fetch all master data by category
export async function GET(req: NextRequest) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    if (!category || !ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
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
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { category, value } = await req.json()
    const valueResult = validateValue(value)

    if (typeof category !== 'string' || !ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    if ('error' in valueResult) {
      return NextResponse.json({ error: valueResult.error }, { status: 400 })
    }

    const newEntry = await prisma.masterData.upsert({
      where: { category_value: { category, value: valueResult.value } },
      update: { isActive: true },
      create: {
        category,
        value: valueResult.value,
        isActive: true,
      },
    })

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create master data:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Entry already exists', code: 'MASTER_DATA_EXISTS' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

// PUT - Update master data entry
export async function PUT(req: NextRequest) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { id, category, value } = await req.json()
    const valueResult = validateValue(value)

    if (!id || typeof category !== 'string' || !ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'ID and valid category are required' }, { status: 400 })
    }
    if ('error' in valueResult) {
      return NextResponse.json({ error: valueResult.error }, { status: 400 })
    }

    const updated = await prisma.masterData.update({
      where: { id, category },
      data: { value: valueResult.value },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Failed to update master data:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Entry already exists', code: 'MASTER_DATA_EXISTS' }, { status: 409 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Entry not found for this category' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

// DELETE - Delete master data entry
export async function DELETE(req: NextRequest) {
  const authorizationError = await requireSuperAdmin()
  if (authorizationError) return authorizationError

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const category = searchParams.get('category')

    if (!id || !category || !ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'ID and valid category are required' }, { status: 400 })
    }

    await prisma.masterData.update({
      where: { id, category },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete master data:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Entry not found for this category' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
