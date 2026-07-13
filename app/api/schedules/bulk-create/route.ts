import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Bulk create multiple schedules
export async function POST(req: NextRequest) {
  try {
    const { schedules } = await req.json()

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return NextResponse.json(
        { error: 'No schedules provided' },
        { status: 400 }
      )
    }

    let created = 0
    const errors: string[] = []

    for (const schedule of schedules) {
      try {
        const { employeeId, shiftId, scheduleDate } = schedule

        // shiftId can be null for day offs
        if (!employeeId || !scheduleDate) {
          errors.push(`Missing required fields for date ${scheduleDate}`)
          continue
        }

        // Check if schedule already exists for this employee and date
        const existing = await prisma.schedule.findFirst({
          where: {
            employeeId,
            scheduleDate: new Date(scheduleDate),
          },
        })

        if (existing) {
          errors.push(`Schedule already exists for ${scheduleDate}`)
          continue
        }

        // If shiftId is null, it's a day off - create with null shiftId
        if (!shiftId) {
          await prisma.schedule.create({
            data: {
              employeeId,
              shiftId: null,
              scheduleDate: new Date(scheduleDate),
              isException: false,
            },
          })
        } else {
          await prisma.schedule.create({
            data: {
              employeeId,
              shiftId,
              scheduleDate: new Date(scheduleDate),
              isException: false,
            },
          })
        }

        created++
      } catch (error) {
        console.error('Error creating schedule:', error)
        errors.push(`Error on date: ${String(error)}`)
      }
    }

    return NextResponse.json({
      success: true,
      created,
      total: schedules.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully created ${created} out of ${schedules.length} schedules`,
    })
  } catch (error) {
    console.error('Bulk create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bulk create failed' },
      { status: 500 }
    )
  }
}
