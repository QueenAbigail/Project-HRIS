import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all salary rules with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const siteId = searchParams.get('siteId')
    const positionId = searchParams.get('positionId')
    const status = searchParams.get('status')

    const where: any = {}
    if (siteId) where.siteId = siteId
    if (positionId) where.positionId = positionId
    if (status) where.status = status

    const rules = await prisma.salaryRule.findMany({
      where,
      include: {
        site: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error('[v0] Error fetching salary rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salary rules' },
      { status: 500 }
    )
  }
}

// POST create new salary rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      positionId,
      siteId,
      baseSalary,
      positionAllowance,
      minimumWage,
      effectiveDate,
      endDate,
      status = 'active'
    } = body

    // Validate required fields
    if (!positionId || !siteId || !baseSalary || !positionAllowance || !minimumWage || !effectiveDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if rule already exists for this position + site
    const existing = await prisma.salaryRule.findUnique({
      where: {
        positionId_siteId: {
          positionId,
          siteId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Salary rule already exists for this position and site' },
        { status: 409 }
      )
    }

    const rule = await prisma.salaryRule.create({
      data: {
        positionId,
        siteId,
        baseSalary: parseFloat(baseSalary),
        positionAllowance: parseFloat(positionAllowance),
        minimumWage: parseFloat(minimumWage),
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
    console.error('[v0] Error creating salary rule:', error)
    return NextResponse.json(
      { error: 'Failed to create salary rule' },
      { status: 500 }
    )
  }
}
