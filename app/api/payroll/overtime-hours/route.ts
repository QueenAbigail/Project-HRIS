import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET overtime hours for a payroll period
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const payrollPeriodId = searchParams.get('payrollPeriodId')
    const userId = searchParams.get('userId')

    if (!payrollPeriodId) {
      return NextResponse.json(
        { error: 'payrollPeriodId is required' },
        { status: 400 }
      )
    }

    const where: any = { payrollPeriodId }
    if (userId) where.userId = userId

    const hours = await prisma.payrollOvertimeHours.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            position: true,
            siteId: true,
          }
        },
        overtimeRule: true,
      },
      orderBy: [{ user: { name: 'asc' } }, { date: 'asc' }]
    })

    return NextResponse.json(hours)
  } catch (error) {
    console.error('[v0] Error fetching overtime hours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overtime hours' },
      { status: 500 }
    )
  }
}

// POST create or update overtime hours
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      payrollPeriodId,
      entries, // Array of overtime entries
    } = body

    if (!payrollPeriodId || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get payroll period to fetch salary info
    const period = await prisma.payrollPeriod.findUnique({
      where: { id: payrollPeriodId }
    })

    if (!period) {
      return NextResponse.json(
        { error: 'Payroll period not found' },
        { status: 404 }
      )
    }

    const createdEntries = []

    for (const entry of entries) {
      const {
        userId,
        overtimeRuleId,
        date,
        hours,
        description,
      } = entry

      // Get overtime rule to fetch multiplier
      const rule = await prisma.overtimeRule.findUnique({
        where: { id: overtimeRuleId }
      })

      if (!rule) {
        continue
      }

      // Get user's salary to calculate hourly rate
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { position: true, siteId: true }
      })

      if (!user) {
        continue
      }

      // Get salary rule for this user
      const salaryRule = await prisma.salaryRule.findUnique({
        where: {
          positionId_siteId: {
            positionId: user.position || '',
            siteId: user.siteId,
          }
        }
      })

      if (!salaryRule) {
        continue
      }

      // Calculate hourly rate (baseSalary / 176 hours per month)
      const hourlyRate = parseFloat(salaryRule.baseSalary.toString()) / 176

      // Calculate total overtime amount
      const totalAmount = parseFloat(hours) * hourlyRate * parseFloat(rule.multiplier.toString())

      // Check if entry already exists
      const existing = await prisma.payrollOvertimeHours.findFirst({
        where: {
          userId,
          payrollPeriodId,
          overtimeRuleId,
          date: new Date(date),
        }
      })

      if (existing) {
        // Update existing
        const updated = await prisma.payrollOvertimeHours.update({
          where: { id: existing.id },
          data: {
            hours: parseFloat(hours),
            hourlyRate,
            multiplier: parseFloat(rule.multiplier.toString()),
            totalAmount,
            description: description || null,
          },
          include: {
            user: true,
            overtimeRule: true,
          }
        })
        createdEntries.push(updated)
      } else {
        // Create new
        const created = await prisma.payrollOvertimeHours.create({
          data: {
            userId,
            payrollPeriodId,
            overtimeRuleId,
            date: new Date(date),
            hours: parseFloat(hours),
            hourlyRate,
            multiplier: parseFloat(rule.multiplier.toString()),
            totalAmount,
            description: description || null,
            status: 'pending',
          },
          include: {
            user: true,
            overtimeRule: true,
          }
        })
        createdEntries.push(created)
      }
    }

    return NextResponse.json(
      { 
        success: true,
        created: createdEntries.length,
        entries: createdEntries
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error saving overtime hours:', error)
    return NextResponse.json(
      { error: 'Failed to save overtime hours' },
      { status: 500 }
    )
  }
}
