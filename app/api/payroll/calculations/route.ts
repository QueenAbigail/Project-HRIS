import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculatePayrollForEmployee,
  calculatePayrollForPeriod,
  approvePayrollForPayment,
} from '@/lib/payroll-calculator'

// GET payroll calculations for a period
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const payrollPeriodId = searchParams.get('payrollPeriodId')
    const userId = searchParams.get('userId')

    const where: any = {}
    if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId
    if (userId) where.userId = userId

    const calculations = await prisma.payrollCalculation.findMany({
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
      orderBy: [{ user: { name: 'asc' } }]
    })

    return NextResponse.json(calculations)
  } catch (error) {
    console.error('[v0] Error fetching payroll calculations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payroll calculations' },
      { status: 500 }
    )
  }
}

// POST calculate payroll
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { payrollPeriodId, scope = 'all', userId } = body

    if (!payrollPeriodId) {
      return NextResponse.json(
        { error: 'payrollPeriodId is required' },
        { status: 400 }
      )
    }

    let result

    if (scope === 'single' && userId) {
      // Calculate for single employee
      const calculation = await calculatePayrollForEmployee({
        userId,
        payrollPeriodId,
      })
      result = {
        calculated: 1,
        failed: 0,
        results: [calculation],
      }
    } else if (scope === 'all') {
      // Calculate for all employees
      result = await calculatePayrollForPeriod(payrollPeriodId)
    } else {
      return NextResponse.json(
        { error: 'Invalid scope' },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[v0] Error calculating payroll:', error)
    return NextResponse.json(
      { error: 'Failed to calculate payroll', details: String(error) },
      { status: 500 }
    )
  }
}

// PATCH approve payroll for payment
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { payrollPeriodId, action, approvedBy } = body

    if (!payrollPeriodId) {
      return NextResponse.json(
        { error: 'payrollPeriodId is required' },
        { status: 400 }
      )
    }

    if (action === 'approve-for-payment') {
      if (!approvedBy) {
        return NextResponse.json(
          { error: 'approvedBy is required' },
          { status: 400 }
        )
      }

      const result = await approvePayrollForPayment(
        payrollPeriodId,
        approvedBy
      )
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] Error updating payroll:', error)
    return NextResponse.json(
      { error: 'Failed to update payroll', details: String(error) },
      { status: 500 }
    )
  }
}
