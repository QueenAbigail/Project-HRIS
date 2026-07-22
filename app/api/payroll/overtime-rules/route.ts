import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all overtime rules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status

    const rules = await prisma.overtimeRule.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error('[v0] Error fetching overtime rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overtime rules' },
      { status: 500 }
    )
  }
}

// POST create new overtime rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type,
      description,
      multiplier,
      maxHoursPerMonth,
      status = 'active'
    } = body

    // Validate required fields
    if (!type || !description || !multiplier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const rule = await prisma.overtimeRule.create({
      data: {
        type,
        description,
        multiplier: parseFloat(multiplier),
        maxHoursPerMonth: maxHoursPerMonth ? parseInt(maxHoursPerMonth) : null,
        status
      }
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating overtime rule:', error)
    return NextResponse.json(
      { error: 'Failed to create overtime rule' },
      { status: 500 }
    )
  }
}
