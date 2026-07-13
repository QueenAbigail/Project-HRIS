import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Bulk create multiple schedules
export async function POST(req: NextRequest) {
  try {
    const { schedules, replace = false, employeeId: filterEmployeeId } = await req.json()

    console.log('[v0] Bulk create received:', schedules.length, 'schedules, replace:', replace)
    console.log('[v0] First schedule sample:', schedules[0])

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return NextResponse.json(
        { error: 'No schedules provided' },
        { status: 400 }
      )
    }

    // If replace mode is enabled, delete existing schedules for this employee in the date range
    if (replace && filterEmployeeId) {
      const dates = schedules.map(s => new Date(s.scheduleDate))
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

      console.log('[v0] Replace mode: deleting schedules for', filterEmployeeId, 'between', minDate, 'and', maxDate)

      await prisma.schedule.deleteMany({
        where: {
          employeeId: filterEmployeeId,
          scheduleDate: {
            gte: minDate,
            lte: maxDate,
          },
        },
      })
    }

    let created = 0
    const errors: string[] = []

    for (const schedule of schedules) {
      try {
        const { employeeId, shiftId, scheduleDate } = schedule

        console.log('[v0] Processing schedule:', { employeeId, shiftId, scheduleDate, type: typeof scheduleDate })

        // shiftId can be null for day offs
        if (!employeeId || !scheduleDate) {
          errors.push(`Missing required fields for date ${scheduleDate}`)
          continue
        }

        // In replace mode, we already deleted existing schedules, so no need to check
        if (!replace) {
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
        }

        // Day offs are not supported in this schema - shiftId is required
        // Skip creating schedules for day offs (they're represented by not having a schedule)
        if (!shiftId) {
          console.log('[v0] Skipping day off for', employeeId, 'on', scheduleDate)
          continue
        }

        // Verify shift exists and get its time details
        const shift = await prisma.shift.findUnique({
          where: { id: shiftId },
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        })

        if (!shift) {
          errors.push(`Shift ${shiftId} not found for date ${scheduleDate}`)
          continue
        }

        await prisma.schedule.create({
          data: {
            employeeId,
            shiftId,
            scheduleDate: new Date(scheduleDate),
            shiftStart: shift.startTime,
            shiftEnd: shift.endTime,
            isException: false,
          },
        })

        created++
      } catch (error) {
        console.error('[v0] Error creating schedule:', error)
        const errorMsg = error instanceof Error ? error.message : String(error)
        errors.push(`Error on ${schedule.scheduleDate}: ${errorMsg}`)
      }
    }

    console.log('[v0] Bulk create completed - created:', created, 'errors:', errors.length)

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
