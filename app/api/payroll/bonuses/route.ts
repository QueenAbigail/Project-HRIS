import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET bonuses for a payroll period
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const payrollPeriodId = searchParams.get('payrollPeriodId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: any = {}
    if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId
    if (userId) where.userId = userId
    if (status) where.status = status

    const bonuses = await prisma.payrollBonus.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            position: true,
          }
        },
        payrollPeriod: true,
      },
      orderBy: [{ createdAt: 'desc' }]
    })

    return NextResponse.json(bonuses)
  } catch (error) {
    console.error('[v0] Error fetching bonuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bonuses' },
      { status: 500 }
    )
  }
}

// POST create new bonus
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      payrollPeriodId,
      userId,
      type,
      amount,
      reason,
      notes,
    } = body

    // Validate required fields
    if (!payrollPeriodId || !userId || !type || !amount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const bonus = await prisma.payrollBonus.create({
      data: {
        payrollPeriodId,
        userId,
        type,
        amount: parseFloat(amount),
        reason,
        notes: notes || null,
        status: 'pending_approval',
      },
      include: {
        user: true,
        payrollPeriod: true,
      }
    })

    return NextResponse.json(bonus, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating bonus:', error)
    return NextResponse.json(
      { error: 'Failed to create bonus' },
      { status: 500 }
    )
  }
}
