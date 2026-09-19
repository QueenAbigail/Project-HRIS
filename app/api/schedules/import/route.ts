import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'
import { requireSuperAdminResponse } from '@/lib/api-auth'
import { isTodayOrEarlier } from '@/lib/schedule-date-policy'

// Import schedules in bulk from Excel file
// Uses the bulk-create endpoint which supports the new manual assignment modes
export async function POST(req: NextRequest) {
  try {
    const authResponse = await requireSuperAdminResponse()
    if (authResponse) return authResponse
    const {
      schedules: importedSchedules,
      finalize = true,
    } = await req.json()

    if (!Array.isArray(importedSchedules) || importedSchedules.length === 0) {
      return NextResponse.json(
        { error: 'No schedules provided' },
        { status: 400 }
      )
    }

    console.log('[v0] Import received:', importedSchedules.length, 'schedules')

    let processed = 0
    const errors: string[] = []
    const schedulesToCreate: Array<{ employeeId: string; shiftId: string; scheduleDate: string; shiftStart: string; shiftEnd: string }> = []
    const schedulesToClear: Array<{ employeeId: string; scheduleDate: string }> = []
    const employeeCache = new Map<string, Awaited<ReturnType<typeof prisma.user.findFirst>>>()
    const shiftCache = new Map<string, Awaited<ReturnType<typeof prisma.shift.findFirst>>>()

    // Parse and validate imported schedules
    for (const schedule of importedSchedules) {
      try {
        const { employeeName, employeeCode, date, shift, rowNumber } = schedule
        const rowLabel = rowNumber ? `Row ${rowNumber}: ` : ''

        if (!employeeCode) {
          errors.push(`${rowLabel}Missing employee code for ${employeeName || 'unknown employee'}`)
          continue
        }

        const normalizedEmployeeCode = String(employeeCode).trim()
        const employeeCacheKey = normalizedEmployeeCode.toLowerCase()
        let employee = employeeCache.get(employeeCacheKey)
        if (employee === undefined) {
          employee = await prisma.user.findFirst({
            where: {
              employeeCode: {
                equals: normalizedEmployeeCode,
                mode: 'insensitive',
              },
            },
          })
          employeeCache.set(employeeCacheKey, employee)
        }

        if (!employee) {
          errors.push(`${rowLabel}Employee Code "${normalizedEmployeeCode}" (${employeeName || 'unnamed employee'}) was not found. Check that it matches an existing employee.`)
          continue
        }

        // Parse the date before applying either a shift assignment or an explicit Off instruction.
        let scheduleDate: string
        try {
          let parsedDate: Date
          if (typeof date === 'number') {
            parsedDate = new Date((date - 25569) * 86400 * 1000)
          } else {
            parsedDate = new Date(date)
          }

          if (isNaN(parsedDate.getTime())) {
            errors.push(`${rowLabel}Invalid date format: ${date}`)
            continue
          }
          scheduleDate = parsedDate.toISOString().split('T')[0]
          if (isTodayOrEarlier(scheduleDate)) {
            errors.push(`${rowLabel}Skipped protected date ${scheduleDate}; today and past schedules cannot be changed by import.`)
            continue
          }
        } catch (e) {
          errors.push(`Error parsing date ${date}: ${String(e)}`)
          continue
        }

        // Empty cells preserve existing data; explicit Off clears a future schedule.
        const shiftCode = String(shift || '').trim().toUpperCase()
        if (!shiftCode) continue
        if (shiftCode === 'OFF' || shiftCode === 'X') {
          schedulesToClear.push({ employeeId: employee.id, scheduleDate })
          continue
        }

        // Map the configured human-readable shift code to its internal ID.
        let foundShift = shiftCache.get(shiftCode)
        if (foundShift === undefined) {
          foundShift = await prisma.shift.findFirst({
            where: { code: shiftCode }
          })
          shiftCache.set(shiftCode, foundShift)
        }
        if (!foundShift) {
          errors.push(`${rowLabel}No matching shift for code ${shiftCode} on ${date}`)
          continue
        }

        const shiftId = foundShift.id

        // Add to bulk create list
        schedulesToCreate.push({
          employeeId: employee.id,
          shiftId,
          scheduleDate,
          shiftStart: foundShift.startTime,
          shiftEnd: foundShift.endTime,
        })

        processed++
      } catch (error) {
        console.error('[v0] Error processing schedule:', error)
        errors.push(`Error processing schedule: ${String(error)}`)
      }
    }

    console.log('[v0] Import processed:', processed, 'schedules to create')

    if (schedulesToCreate.length === 0 && schedulesToClear.length === 0) {
      return NextResponse.json({
        success: false,
        created: 0,
        cleared: 0,
        errors,
        message: `No valid schedule changes to import (${errors.length} errors)`
      })
    }

    // All database writes run in one transaction. Row validation errors above are
    // allowed to continue, but a database failure rolls back every write.
    let created = 0
    let updated = 0
    let cleared = 0

    try {
      const result = await prisma.$transaction(async (tx) => {
        for (const schedule of schedulesToClear) {
          const deleted = await tx.schedule.deleteMany({
            where: {
              employeeId: schedule.employeeId,
              scheduleDate: new Date(schedule.scheduleDate),
            },
          })
          cleared += deleted.count
        }

        for (const schedule of schedulesToCreate) {
          const scheduleDate = new Date(schedule.scheduleDate)
          const existingSchedule = await tx.schedule.findUnique({
            where: {
              employeeId_scheduleDate: {
                employeeId: schedule.employeeId,
                scheduleDate,
              },
            },
            select: { id: true },
          })

          await tx.schedule.upsert({
            where: {
              employeeId_scheduleDate: {
                employeeId: schedule.employeeId,
                scheduleDate,
              },
            },
            create: {
              employeeId: schedule.employeeId,
              shiftId: schedule.shiftId,
              scheduleDate,
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

          if (existingSchedule) updated++
          else created++
        }

        return { created, updated, cleared }
      })

      created = result.created
      updated = result.updated
      cleared = result.cleared
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database error'
      console.error('[v0] Atomic schedule import rolled back:', error)
      return NextResponse.json({
        success: false,
        created: 0,
        updated: 0,
        cleared: 0,
        errors: [...errors, `Import rolled back: ${message.split('\\n')[0]}`],
        message: 'No schedule changes were saved because the database import failed.',
      }, { status: 500 })
    }

    const bulkResult = { created, updated, errors: [] as string[] }
    console.log('[v0] Atomic schedule import result:', { created, updated, cleared })

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
      success: bulkResult.created > 0 || bulkResult.updated > 0 || cleared > 0,
      created: bulkResult.created,
      updated: bulkResult.updated,
      cleared,
      errors: allErrors,
      message: bulkResult.created + bulkResult.updated > 0
        ? `Successfully processed ${bulkResult.created} created and ${bulkResult.updated} updated schedules${allErrors.length > 0 ? ` (${allErrors.length} errors)` : ''}`
        : `No schedules were imported. ${allErrors.length} row errors were found.`,
    }, { status: bulkResult.created + bulkResult.updated > 0 ? 200 : 422 })
  } catch (error) {
    console.error('[v0] Schedule import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
