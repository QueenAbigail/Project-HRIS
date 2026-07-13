import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'

// Import schedules in bulk from Excel file
// Uses the bulk-create endpoint which supports the new manual assignment modes
export async function POST(req: NextRequest) {
  try {
    const { schedules: importedSchedules, replace = true } = await req.json()

    if (!Array.isArray(importedSchedules) || importedSchedules.length === 0) {
      return NextResponse.json(
        { error: 'No schedules provided' },
        { status: 400 }
      )
    }

    console.log('[v0] Import received:', importedSchedules.length, 'schedules, replace:', replace)

    let processed = 0
    const errors: string[] = []
    const schedulesToCreate: Array<{ employeeId: string; shiftId: string; scheduleDate: string }> = []
    const employeesProcessed = new Set<string>()

    // Parse and validate imported schedules
    for (const schedule of importedSchedules) {
      try {
        const { employeeName, employeeId, date, shift } = schedule

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
        const shiftCode = String(shift).toUpperCase()

        if (shiftCode === 'P' || shiftCode === 'PAGI' || shiftCode === 'MORNING') {
          const foundShift = await prisma.shift.findFirst({
            where: { name: { contains: 'Morning', mode: 'insensitive' } }
          })
          if (foundShift) shiftId = foundShift.id
        } else if (shiftCode === 'M' || shiftCode === 'MALAM' || shiftCode === 'EVENING') {
          const foundShift = await prisma.shift.findFirst({
            where: { name: { contains: 'Evening', mode: 'insensitive' } }
          })
          if (foundShift) shiftId = foundShift.id
        } else if (shiftCode === 'X' || shiftCode === 'OFF' || shiftCode === 'DAY OFF') {
          // Skip day off entries
          continue
        }

        if (!shiftId) {
          errors.push(`No matching shift for code ${shiftCode} on ${date}`)
          continue
        }

        // Parse date
        let scheduleDate: string
        try {
          let parsedDate: Date
          if (typeof date === 'number') {
            // Excel serial number
            parsedDate = new Date((date - 25569) * 86400 * 1000)
          } else {
            parsedDate = new Date(date)
          }

          if (isNaN(parsedDate.getTime())) {
            errors.push(`Invalid date format: ${date}`)
            continue
          }
          scheduleDate = parsedDate.toISOString().split('T')[0]
        } catch (e) {
          errors.push(`Error parsing date ${date}: ${String(e)}`)
          continue
        }

        // Add to bulk create list
        schedulesToCreate.push({
          employeeId: employee.id,
          shiftId,
          scheduleDate,
        })

        employeesProcessed.add(employee.id)
        processed++
      } catch (error) {
        console.error('[v0] Error processing schedule:', error)
        errors.push(`Error processing schedule: ${String(error)}`)
      }
    }

    console.log('[v0] Import processed:', processed, 'schedules to create')

    if (schedulesToCreate.length === 0) {
      return NextResponse.json({
        success: false,
        created: 0,
        errors,
        message: `No valid schedules to import (${errors.length} errors)`
      })
    }

    // Use bulk-create endpoint for consistency with manual UI
    const bulkCreateResponse = await fetch(
      new URL('/api/schedules/bulk-create', req.nextUrl.origin).toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedules: schedulesToCreate,
          replace,
          // If replacing, send first employee ID (imports usually per-employee)
          employeeId: employeesProcessed.size === 1 ? Array.from(employeesProcessed)[0] : undefined,
        }),
      }
    )

    const bulkResult = await bulkCreateResponse.json()
    console.log('[v0] Bulk create result:', bulkResult)

    // Generate today's attendance if any schedules were created for today
    if (bulkResult.created > 0) {
      try {
        await generateTodayAttendanceRecords()
      } catch (attendanceError) {
        console.error('[v0] Error generating attendance:', attendanceError)
      }
    }

    return NextResponse.json({
      success: bulkResult.created > 0,
      created: bulkResult.created,
      errors: [...(bulkResult.errors || []), ...errors],
      message: `Successfully imported ${bulkResult.created} schedules${errors.length > 0 ? ` (${errors.length} errors)` : ''}`
    })
  } catch (error) {
    console.error('[v0] Schedule import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
