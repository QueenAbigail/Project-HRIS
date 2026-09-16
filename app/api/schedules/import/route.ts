import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'
import { getCurrentUser } from '@/lib/system'

async function requireSuperAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }
}

// Import schedules in bulk from Excel file
// Uses the bulk-create endpoint which supports the new manual assignment modes
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin()
    const {
      schedules: importedSchedules,
      replace = true,
      replaceScope,
      finalize = true,
    } = await req.json()

    if (!Array.isArray(importedSchedules) || importedSchedules.length === 0) {
      return NextResponse.json(
        { error: 'No schedules provided' },
        { status: 400 }
      )
    }

    console.log('[v0] Import received:', importedSchedules.length, 'schedules, replace:', replace)

    let processed = 0
    const errors: string[] = []
    const schedulesToCreate: Array<{ employeeId: string; shiftId: string; scheduleDate: string; shiftStart: string; shiftEnd: string }> = []
    const employeesProcessed = new Set<string>()

    // Parse and validate imported schedules
    for (const schedule of importedSchedules) {
      try {
        const { employeeName, employeeCode, date, shift } = schedule

        if (!employeeCode) {
          errors.push(`Missing employee code for ${employeeName || 'unknown employee'}`)
          continue
        }

        const normalizedEmployeeCode = String(employeeCode).trim()
        const employee = await prisma.user.findFirst({
          where: {
            employeeCode: {
              equals: normalizedEmployeeCode,
              mode: 'insensitive',
            },
          },
        })

        if (!employee) {
          errors.push(`Employee Code "${normalizedEmployeeCode}" (${employeeName || 'unnamed employee'}) was not found. Check that it matches an existing employee.`)
          continue
        }

        // Map the configured human-readable shift code to its internal ID.
        const shiftCode = String(shift || '').trim().toUpperCase()
        if (shiftCode === 'OFF' || shiftCode === 'X') continue

        const foundShift = await prisma.shift.findFirst({
          where: { code: shiftCode }
        })
        const shiftId = foundShift?.id

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
          shiftStart: foundShift.startTime,
          shiftEnd: foundShift.endTime,
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

    // Create directly instead of making a server-to-server request to the bulk endpoint.
    // Internal fetches can resolve the preview origin to HTTPS, which is not available from the VM.
    if (replace && replaceScope) {
      const scopedEmployees = await prisma.user.findMany({
        where: { employeeCode: { in: replaceScope.employeeCodes } },
        select: { id: true },
      })
      await prisma.schedule.deleteMany({
        where: {
          employeeId: { in: scopedEmployees.map((employee) => employee.id) },
          scheduleDate: {
            gte: new Date(replaceScope.startDate),
            lte: new Date(replaceScope.endDate),
          },
        },
      })
    } else if (replace && employeesProcessed.size === 1) {
      const dates = schedulesToCreate.map((schedule) => new Date(schedule.scheduleDate))
      await prisma.schedule.deleteMany({
        where: {
          employeeId: Array.from(employeesProcessed)[0],
          scheduleDate: {
            gte: new Date(Math.min(...dates.map((date) => date.getTime()))),
            lte: new Date(Math.max(...dates.map((date) => date.getTime()))),
          },
        },
      })
    }

    let created = 0
    const bulkErrors: string[] = []
    for (const schedule of schedulesToCreate) {
      try {
        await prisma.schedule.upsert({
          where: {
            employeeId_scheduleDate: {
              employeeId: schedule.employeeId,
              scheduleDate: new Date(schedule.scheduleDate),
            },
          },
          create: {
            employeeId: schedule.employeeId,
            shiftId: schedule.shiftId,
            scheduleDate: new Date(schedule.scheduleDate),
            shiftStart: schedule.shiftStart,
            shiftEnd: schedule.shiftEnd,
            isException: false,
          },
          update: {
            shiftId: schedule.shiftId,
            shiftStart: schedule.shiftStart,
            shiftEnd: schedule.shiftEnd,
          },
        })
        created++
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Database error'
        bulkErrors.push(`Could not import ${schedule.scheduleDate}: ${message.split('\\n')[0]}`)
      }
    }

    const bulkResult = { created, errors: bulkErrors }
    console.log('[v0] Direct schedule create result:', bulkResult)

    // Generate today's attendance if any schedules were created for today
    if (finalize && bulkResult.created > 0) {
      try {
        await generateTodayAttendanceRecords()
      } catch (attendanceError) {
        console.error('[v0] Error generating attendance:', attendanceError)
      }
    }

    const allErrors = [...(bulkResult.errors || []), ...errors]
    return NextResponse.json({
      success: bulkResult.created > 0,
      created: bulkResult.created,
      errors: allErrors,
      message: bulkResult.created > 0
        ? `Successfully imported ${bulkResult.created} schedules${allErrors.length > 0 ? ` (${allErrors.length} errors)` : ''}`
        : `No schedules were imported. ${allErrors.length} row errors were found.`,
    }, { status: bulkResult.created > 0 ? 200 : 422 })
  } catch (error) {
    console.error('[v0] Schedule import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
