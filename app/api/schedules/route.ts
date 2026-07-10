import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
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
    const body = await req.json()
    const { employeeId, shiftId, scheduleDate, shiftStart, shiftEnd, isException, notes } = body

    if (!employeeId || !shiftId || !scheduleDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await prisma.schedule.create({
      data: {
        employeeId,
        shiftId,
        scheduleDate: new Date(scheduleDate),
        shiftStart: shiftStart || '',
        shiftEnd: shiftEnd || '',
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
