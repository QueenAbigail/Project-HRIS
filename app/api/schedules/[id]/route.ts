import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdminResponse } from '@/lib/api-auth'
import { isTodayOrEarlier, protectedDateMessage } from '@/lib/schedule-date-policy'

// Update or delete individual schedule by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResponse = await requireSuperAdminResponse()
    if (authResponse) return authResponse
    const body = await req.json()
    const { employeeId, shiftId, scheduleDate, shiftStart, shiftEnd, isException, notes, allowProtectedDateChange } = body

    if (!employeeId || !shiftId || !scheduleDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (isTodayOrEarlier(scheduleDate) && !allowProtectedDateChange) {
      return NextResponse.json({ error: protectedDateMessage(scheduleDate) }, { status: 409 })
    }

    const result = await prisma.schedule.update({
      where: { id: id },
      data: {
        employeeId,
        shiftId,
        scheduleDate: new Date(scheduleDate),
        shiftStart,
        shiftEnd,
        isException: isException ?? false,
        notes
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule updated',
      data: result
    })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResponse = await requireSuperAdminResponse()
    if (authResponse) return authResponse
    const { allowProtectedDateChange = false } = await req.json().catch(() => ({}))
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id },
      select: { scheduleDate: true },
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    if (isTodayOrEarlier(existingSchedule.scheduleDate) && !allowProtectedDateChange) {
      return NextResponse.json({ error: protectedDateMessage(existingSchedule.scheduleDate) }, { status: 409 })
    }

    await prisma.schedule.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted'
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
