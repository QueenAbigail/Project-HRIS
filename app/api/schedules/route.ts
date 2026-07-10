import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { schedules, employees, shifts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const allSchedules = await db
      .select({
        id: schedules.id,
        employeeId: schedules.employeeId,
        employeeName: employees.name,
        shiftId: schedules.shiftId,
        shiftName: shifts.name,
        shiftStart: shifts.startTime,
        shiftEnd: shifts.endTime,
        scheduleDate: schedules.scheduleDate,
      })
      .from(schedules)
      .leftJoin(employees, eq(schedules.employeeId, employees.id))
      .leftJoin(shifts, eq(schedules.shiftId, shifts.id))

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
    const { employeeId, shiftId, scheduleDate } = body

    if (!employeeId || !shiftId || !scheduleDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await db.insert(schedules).values({
      employeeId,
      shiftId,
      scheduleDate: new Date(scheduleDate),
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule created',
      id: result.insertId,
    })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create schedule' },
      { status: 500 }
    )
  }
}
