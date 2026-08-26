import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

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
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Calculate working days - count days with schedules in the date range
    const scheduledDays = await prisma.schedule.count({
      where: {
        employeeId: userId,
        scheduleDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    })

    // Use scheduled days if available, otherwise fall back to calendar days
    let workingDaysCount = scheduledDays > 0 ? scheduledDays : 
      Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    console.log('[v0] Leave validation - Working days calculated:', workingDaysCount, 'from', scheduledDays, 'scheduled days')

    // Create the leave record
    const leave = await prisma.leave.create({
      data: {
        userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
        attachmentUrl: attachmentUrl || null,
        status: 'Pending',
        workingDaysCount,
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
