import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { getLeaveReadAuthorization, leaveAuthorizationResponse } from '@/lib/leave-authorization'
import { countWeekdays } from '@/lib/leave-validation'
import { canManageLeaves } from '@/lib/leave-authorization'

export async function GET(request: NextRequest) {
  try {
    const authorization = await getLeaveReadAuthorization()
    if (!authorization.user) return leaveAuthorizationResponse(authorization.error)

    const leaves = await prisma.leave.findMany({
      where: authorization.where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            initials: true,
            department: true,
            site: { select: { name: true } },
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
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!canManageLeaves(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { leaveType, startDate, endDate, reason, attachmentUrl } = body
    const userId = currentUser.id

    if (!leaveType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: leaveType, startDate, endDate' },
        { status: 400 }
      )
    }

    const start = new Date(`${startDate}T00:00:00Z`)
    const end = new Date(`${endDate}T00:00:00Z`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Start date and end date must be valid dates' }, { status: 400 })
    }
    if (start > end) {
      return NextResponse.json({ error: 'End date must be on or after the start date' }, { status: 400 })
    }

    const configuredLeaveType = await prisma.masterData.findFirst({
      where: {
        category: 'leaveType',
        value: leaveType,
        isActive: true,
      },
      select: { id: true },
    })
    if (!configuredLeaveType) {
      return NextResponse.json({ error: 'Invalid or inactive leave type' }, { status: 400 })
    }

    const workingDaysCount = countWeekdays(start, end)
    if (workingDaysCount === 0) {
      return NextResponse.json({ error: 'The selected date range contains no working days' }, { status: 400 })
    }

    // Create the leave record
    const leave = await prisma.leave.create({
      data: {
        userId,
        leaveType,
        startDate: start,
        endDate: end,
        reason: reason || null,
        attachmentUrl: attachmentUrl || null,
        status: 'Pending',
        workingDaysCount,
        dayBreakdown: JSON.stringify({ summary: `${workingDaysCount} working day(s)` }),
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
