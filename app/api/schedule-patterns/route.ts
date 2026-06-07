import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all schedule patterns
export async function GET(request: NextRequest) {
  try {
    const patterns = await prisma.schedulePattern.findMany({
      include: {
        shift: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(patterns)
  } catch (error) {
    console.error('[v0] Error fetching schedule patterns:', error)
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 })
  }
}

// POST create new schedule pattern
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const pattern = await prisma.schedulePattern.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        workingDays: body.workingDays ? JSON.stringify(body.workingDays) : null,
        shiftId: body.shiftId,
        rotatingPattern: body.rotatingPattern ? JSON.stringify(body.rotatingPattern) : null,
        moduloPattern: body.moduloPattern ? JSON.stringify(body.moduloPattern) : null,
        isActive: body.isActive ?? true,
        assignedEmployees: body.assignedEmployees ?? 0,
      },
      include: {
        shift: true,
      },
    })

    return NextResponse.json(pattern, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating schedule pattern:', error)
    return NextResponse.json({ error: 'Failed to create pattern' }, { status: 500 })
  }
}

// PUT update schedule pattern
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Pattern ID is required' }, { status: 400 })
    }

    const pattern = await prisma.schedulePattern.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        workingDays: body.workingDays ? JSON.stringify(body.workingDays) : null,
        shiftId: body.shiftId,
        rotatingPattern: body.rotatingPattern ? JSON.stringify(body.rotatingPattern) : null,
        moduloPattern: body.moduloPattern ? JSON.stringify(body.moduloPattern) : null,
        isActive: body.isActive,
        assignedEmployees: body.assignedEmployees,
      },
      include: {
        shift: true,
      },
    })

    return NextResponse.json(pattern)
  } catch (error) {
    console.error('[v0] Error updating schedule pattern:', error)
    return NextResponse.json({ error: 'Failed to update pattern' }, { status: 500 })
  }
}

// DELETE schedule pattern
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Pattern ID is required' }, { status: 400 })
    }

    await prisma.schedulePattern.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting schedule pattern:', error)
    return NextResponse.json({ error: 'Failed to delete pattern' }, { status: 500 })
  }
}
