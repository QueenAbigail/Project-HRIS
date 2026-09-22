import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdminResponse } from '@/lib/api-auth'
import { isTodayOrEarlier, protectedDateMessage } from '@/lib/schedule-date-policy'

// Get all schedules or create new one
export async function GET(req: NextRequest) {
  try {
    const authResponse = await requireSuperAdminResponse()
    if (authResponse) return authResponse
    const allSchedules = await prisma.schedule.findMany({
      include: {
        employee: {
          select: {
            id: true,
            name: true
          }
        },
        shift: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        scheduleDate: 'desc'
      }
    })

    return NextResponse.json(allSchedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResponse = await requireSuperAdminResponse()
    if (authResponse) return authResponse
    const body = await req.json()
    const { employeeId, shiftId, scheduleDate, shiftStart, shiftEnd, isException, notes, allowProtectedDateChange } = body

    if (isTodayOrEarlier(scheduleDate) && !allowProtectedDateChange) {
      return NextResponse.json({ error: protectedDateMessage(scheduleDate) }, { status: 409 })
    }

    if (!employeeId || !shiftId || !scheduleDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      select: { startTime: true, endTime: true },
    })

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const result = await prisma.schedule.create({
      data: {
        employeeId,
        shiftId,
        scheduleDate: new Date(`${scheduleDate}T00:00:00.000Z`),
        shiftStart: shiftStart || shift.startTime,
        shiftEnd: shiftEnd || shift.endTime,
        isException: isException ?? false,
        notes
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule created',
      data: result
    })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create schedule' },
      { status: 500 }
    )
  }
}
