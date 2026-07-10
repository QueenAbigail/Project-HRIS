import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'

// Import schedules in bulk from Excel file
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
        const { employeeName, employeeId, date, shift, shiftStart, shiftEnd } = schedule

        // Find employee by name or ID
        let employee
        if (employeeId) {
          employee = await prisma.user.findUnique({
            where: { id: employeeId }
          })
        } else {
          employee = await prisma.user.findFirst({
            where: { name: employeeName }
          })
        }

        if (!employee) {
          errors.push(`Employee ${employeeName || employeeId} not found`)
          continue
        }

        // Map shift code to shift ID
        let shiftId: string | null = null
        let finalShiftStart = shiftStart
        let finalShiftEnd = shiftEnd

        // Handle different shift codes
        const shiftCode = String(shift).toUpperCase()
        if (shiftCode === 'P' || shiftCode === 'PAGI' || shiftCode === 'MORNING') {
          const foundShift = await prisma.shift.findFirst({
            where: { name: { contains: 'Morning', mode: 'insensitive' } }
          })
          if (foundShift) {
            shiftId = foundShift.id
            finalShiftStart = foundShift.startTime
            finalShiftEnd = foundShift.endTime
          }
        } else if (shiftCode === 'M' || shiftCode === 'MALAM' || shiftCode === 'EVENING') {
          const foundShift = await prisma.shift.findFirst({
            where: { name: { contains: 'Evening', mode: 'insensitive' } }
          })
          if (foundShift) {
            shiftId = foundShift.id
            finalShiftStart = foundShift.startTime
            finalShiftEnd = foundShift.endTime
          }
        } else if (shiftCode === 'X' || shiftCode === 'OFF' || shiftCode === 'DAY OFF') {
          // Skip day off entries
          continue
        }

        if (!shiftId) {
          errors.push(`No matching shift for code ${shiftCode} on ${date}`)
          continue
        }

        // Parse date
        let scheduleDate: Date
        try {
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
        await prisma.schedule.create({
          data: {
            employeeId: employee.id,
            shiftId,
            scheduleDate,
            shiftStart: finalShiftStart,
            shiftEnd: finalShiftEnd,
            isException: false
          }
        })

        created++
      } catch (error) {
        console.error('Error creating schedule:', error)
        errors.push(`Error creating schedule: ${String(error)}`)
      }
    }

    // Generate today's attendance if any schedules were created for today
    if (created > 0) {
      try {
        await generateTodayAttendanceRecords()
      } catch (attendanceError) {
        console.error('Error generating attendance:', attendanceError)
      }
    }

    return NextResponse.json({
      success: true,
      created,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${created} schedules${errors.length > 0 ? ` (${errors.length} errors)` : ''}`
    })
  } catch (error) {
    console.error('Schedule import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
