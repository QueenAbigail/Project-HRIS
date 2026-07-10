import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { schedules, employees, shifts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { schedules: importedSchedules } = await req.json()

    if (!Array.isArray(importedSchedules) || importedSchedules.length === 0) {
      return NextResponse.json(
        { error: 'No schedules provided' },
        { status: 400 }
      )
    }

    let created = 0
    const errors: string[] = []

    for (const schedule of importedSchedules) {
      try {
        const { employeeName, employeeId, date, shift } = schedule

        // Find employee
        const employee = await db
          .select()
          .from(employees)
          .where(eq(employees.name, employeeName))
          .limit(1)

        if (!employee.length) {
          errors.push(`Employee ${employeeName} not found`)
          continue
        }

        // Map shift code to shift ID
        let shiftId: string | null = null

        // Handle different shift codes
        const shiftCode = String(shift).toUpperCase()
        if (shiftCode === 'P' || shiftCode === 'PAGI' || shiftCode === 'MORNING') {
          // Find morning shift
          const morningShift = await db
            .select()
            .from(shifts)
            .where(eq(shifts.name, 'Morning')) // Adjust based on your shift naming
            .limit(1)
          shiftId = morningShift[0]?.id || null
        } else if (shiftCode === 'M' || shiftCode === 'MALAM' || shiftCode === 'EVENING') {
          // Find evening shift
          const eveningShift = await db
            .select()
            .from(shifts)
            .where(eq(shifts.name, 'Evening'))
            .limit(1)
          shiftId = eveningShift[0]?.id || null
        } else if (shiftCode === 'X' || shiftCode === 'OFF' || shiftCode === 'DAY OFF') {
          // Skip day off entries
          continue
        }

        if (!shiftId) {
          errors.push(`No matching shift for code ${shiftCode} on ${date}`)
          continue
        }

        // Parse date - handle different formats
        let scheduleDate: Date
        try {
          // Try to parse the date from Excel
          if (typeof date === 'number') {
            // Excel serial number
            scheduleDate = new Date((date - 25569) * 86400 * 1000)
          } else {
            scheduleDate = new Date(date)
          }

          if (isNaN(scheduleDate.getTime())) {
            errors.push(`Invalid date format: ${date}`)
            continue
          }
        } catch (e) {
          errors.push(`Error parsing date ${date}: ${String(e)}`)
          continue
        }

        // Create schedule record
        await db.insert(schedules).values({
          employeeId: employee[0].id,
          shiftId,
          scheduleDate,
          createdAt: new Date(),
        })

        created++
      } catch (error) {
        console.error('Error creating schedule:', error)
        errors.push(`Error creating schedule: ${String(error)}`)
      }
    }

    // Generate today's attendance if any schedules were created for today
    if (created > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todaysSchedules = await db
        .select()
        .from(schedules)
        .where(eq(schedules.scheduleDate, today))

      // TODO: Generate attendance records here
      // This would call the attendance generation logic
    }

    return NextResponse.json({
      success: true,
      created,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${created} schedules${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
    })
  } catch (error) {
    console.error('Schedule import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
