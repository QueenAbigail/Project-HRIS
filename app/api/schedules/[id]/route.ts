import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { schedules } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { employeeId, shiftId, scheduleDate } = body

    if (!employeeId || !shiftId || !scheduleDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await db
      .update(schedules)
      .set({
        employeeId,
        shiftId,
        scheduleDate: new Date(scheduleDate),
      })
      .where(eq(schedules.id, params.id))

    return NextResponse.json({
      success: true,
      message: 'Schedule updated',
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
    await db.delete(schedules).where(eq(schedules.id, params.id))

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted',
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
