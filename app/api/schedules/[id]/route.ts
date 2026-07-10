import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { employeeId, shiftId, scheduleDate, shiftStart, shiftEnd, isException, notes } = body

    if (!employeeId || !shiftId || !scheduleDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await prisma.schedule.update({
      where: { id: params.id },
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.schedule.delete({
      where: { id: params.id }
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
