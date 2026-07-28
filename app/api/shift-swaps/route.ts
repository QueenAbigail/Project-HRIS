import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

// GET all shift swaps
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // Filter by status (Pending, Approved, Rejected)
    const userId = searchParams.get('userId') // Filter by employee
    const siteId = searchParams.get('siteId')

    const where: any = {}
    if (status) where.status = status
    if (userId) where.OR = [{ employeeFromId: userId }, { employeeToId: userId }]
    if (siteId) where.siteId = siteId

    const swaps = await prisma.shiftSwap.findMany({
      where,
      include: {
        employeeFrom: { select: { id: true, name: true, employeeCode: true, department: true } },
        employeeTo: { select: { id: true, name: true, employeeCode: true, department: true } },
        site: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(swaps)
  } catch (error) {
    console.error('[v0] Error fetching shift swaps:', error)
    return NextResponse.json({ error: 'Failed to fetch shift swaps' }, { status: 500 })
  }
}

// POST create shift swap request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeFromId, employeeToId, swapDate, siteId, reason } = body

    if (!employeeFromId || !employeeToId || !swapDate || !siteId) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeFromId, employeeToId, swapDate, siteId' },
        { status: 400 }
      )
    }

    // Validate both employees exist and work at the same site
    const [empFrom, empTo] = await Promise.all([
      prisma.user.findUnique({ where: { id: employeeFromId } }),
      prisma.user.findUnique({ where: { id: employeeToId } }),
    ])

    if (!empFrom || !empTo) {
      return NextResponse.json({ error: 'One or both employees not found' }, { status: 404 })
    }

    if (empFrom.siteId !== siteId || empTo.siteId !== siteId) {
      return NextResponse.json(
        { error: 'Both employees must work at the same site' },
        { status: 400 }
      )
    }

    // Check if they already have a swap on this date
    const existingSwap = await prisma.shiftSwap.findUnique({
      where: {
        employeeFromId_employeeToId_swapDate: {
          employeeFromId,
          employeeToId,
          swapDate: new Date(swapDate),
        },
      },
    })

    if (existingSwap) {
      return NextResponse.json(
        { error: 'Swap request already exists for these employees on this date' },
        { status: 409 }
      )
    }

    // Verify both employees have shifts on that date
    const swapDateObj = new Date(swapDate)
    const schedules = await prisma.schedule.findMany({
      where: {
        employeeId: { in: [employeeFromId, employeeToId] },
        scheduleDate: swapDateObj,
      },
      include: { shift: true },
    })

    if (schedules.length < 2) {
      return NextResponse.json(
        { error: 'One or both employees do not have shifts assigned for this date' },
        { status: 400 }
      )
    }

    // Create shift swap
    const swap = await prisma.shiftSwap.create({
      data: {
        employeeFromId,
        employeeToId,
        swapDate: new Date(swapDate),
        siteId,
        reason: reason || null,
        status: 'Pending',
      },
      include: {
        employeeFrom: { select: { id: true, name: true, employeeCode: true, department: true } },
        employeeTo: { select: { id: true, name: true, employeeCode: true, department: true } },
        site: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ success: true, swap })
  } catch (error) {
    console.error('[v0] Error creating shift swap:', error)
    return NextResponse.json(
      { error: 'Failed to create shift swap', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
