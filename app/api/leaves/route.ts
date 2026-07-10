import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { calculateWorkingDaysForLeave, formatDayBreakdown } from '@/lib/leave-validation'

export async function GET(request: NextRequest) {
  try {
    // Get current user to check if CLIENT role
    const currentUser = await getCurrentUser()
    const isClient = currentUser?.role === 'CLIENT'
    
    const leaves = await prisma.leave.findMany({
      where: isClient ? { user: { companyId: currentUser?.companyId } } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            department: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(leaves)
  } catch (error) {
    console.error('[v0] Error fetching leaves:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaves' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, leaveType, startDate, endDate, reason, attachmentUrl, status } = body

    if (!userId || !leaveType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, leaveType, startDate, endDate' },
        { status: 400 }
      )
    }

    // Fetch employee's current active pattern assignment
    const patternAssignment = await prisma.employeePatternAssignment.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        startDate: { lte: new Date(startDate) },
        OR: [{ endDate: null }, { endDate: { gte: new Date(startDate) } }],
      },
      include: {
        pattern: true,
      },
    })

    let workingDaysCount = 0
    let dayBreakdown: string | null = null

    if (patternAssignment && patternAssignment.pattern) {
      try {
        // Calculate working days based on pattern type
        const result = await calculateWorkingDaysForLeave(
          new Date(startDate),
          new Date(endDate),
          patternAssignment.pattern
        )

        workingDaysCount = result.workingDaysCount
        dayBreakdown = JSON.stringify({
          summary: result.summary,
          breakdown: result.breakdown,
        })

        console.log('[v0] Leave validation - Pattern:', patternAssignment.pattern.type, 'Working days:', workingDaysCount, 'Summary:', result.summary)
      } catch (error) {
        console.error('[v0] Error calculating working days:', error)
        // Continue without pattern validation if error
        workingDaysCount = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      }
    } else {
      // No pattern found, use calendar days as fallback
      workingDaysCount = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      console.log('[v0] No active pattern found for user, using calendar days')
    }

    // Create the leave record
    const leave = await prisma.leave.create({
      data: {
        userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
        attachmentUrl: attachmentUrl || null,
        status: status || 'Pending',
        workingDaysCount,
        dayBreakdown,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      leave,
      validation: {
        workingDaysCount,
        dayBreakdown: dayBreakdown ? JSON.parse(dayBreakdown) : null,
      },
    })
  } catch (error) {
    console.error('[v0] Error creating leave:', error)
    return NextResponse.json(
      { error: 'Failed to create leave', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
