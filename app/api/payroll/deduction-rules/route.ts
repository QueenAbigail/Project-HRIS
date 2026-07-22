import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all deduction rules with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const siteId = searchParams.get('siteId')
    const positionId = searchParams.get('positionId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = {}
    if (siteId) where.siteId = siteId
    if (positionId) where.positionId = positionId
    if (type) where.type = type
    if (status) where.status = status

    const rules = await prisma.deductionRule.findMany({
      where,
      include: {
        site: true
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error('[v0] Error fetching deduction rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deduction rules' },
      { status: 500 }
    )
  }
}

// POST create new deduction rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      positionId,
      siteId,
      name,
      type,
      deductionType,
      value,
      isApplicableToAll = true,
      riskLevel,
      effectiveDate,
      endDate,
      status = 'active'
    } = body

    // Validate required fields
    if (!positionId || !siteId || !name || !type || !deductionType || !value || !effectiveDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const rule = await prisma.deductionRule.create({
      data: {
        positionId,
        siteId,
        name,
        type,
        deductionType,
        value: parseFloat(value),
        isApplicableToAll,
        riskLevel: riskLevel || null,
        effectiveDate: new Date(effectiveDate),
        endDate: endDate ? new Date(endDate) : null,
        status
      },
      include: {
        site: true
      }
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating deduction rule:', error)
    return NextResponse.json(
      { error: 'Failed to create deduction rule' },
      { status: 500 }
    )
  }
}
