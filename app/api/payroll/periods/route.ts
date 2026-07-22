import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all payroll periods
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) where.status = status

    const periods = await prisma.payrollPeriod.findMany({
      where,
      orderBy: { month: 'desc' },
      include: {
        calculations: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json(periods)
  } catch (error) {
    console.error('[v0] Error fetching payroll periods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payroll periods' },
      { status: 500 }
    )
  }
}

// POST create new payroll period
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      month,
      startDate,
      endDate,
      notes
    } = body

    // Validate required fields
    if (!month || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if period already exists for this month
    const existing = await prisma.payrollPeriod.findUnique({
      where: {
        month: new Date(month)
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Payroll period already exists for this month' },
        { status: 409 }
      )
    }

    const period = await prisma.payrollPeriod.create({
      data: {
        month: new Date(month),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes || null,
        status: 'draft'
      }
    })

    return NextResponse.json(period, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating payroll period:', error)
    return NextResponse.json(
      { error: 'Failed to create payroll period' },
      { status: 500 }
    )
  }
}
