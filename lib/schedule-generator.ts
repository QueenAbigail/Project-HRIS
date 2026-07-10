import { prisma } from '@/lib/prisma'

/**
 * Generates schedules for all active employees for a given date range
 * based on their assigned patterns (FIXED, ROTATING, MODULO)
 */
export async function generateSchedulesForDateRange(
  startDate: Date,
  endDate: Date,
  daysAhead: number = 90
) {
  try {
    console.log('[v0] Starting schedule generation for', startDate, 'to', endDate)

    // Get all active employees with their pattern assignments
    const activeAssignments = await prisma.employeePatternAssignment.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: endDate },
        OR: [
          { endDate: null },
          { endDate: { gte: startDate } }
        ]
      },
      include: {
        user: true,
        pattern: true
      }
    })

    console.log('[v0] Found', activeAssignments.length, 'active pattern assignments')

    let schedulesCreated = 0
    let schedulesSkipped = 0

    // For each employee with a pattern
    for (const assignment of activeAssignments) {
      console.log('[v0] Generating schedules for', assignment.user.name, '- Pattern:', assignment.pattern.type)

      try {
        const result = await generateSchedulesForEmployee(assignment, startDate, endDate)
        schedulesCreated += result.created
        schedulesSkipped += result.skipped
      } catch (err) {
        console.error('[v0] Error generating schedules for', assignment.user.name, ':', err)
      }
    }

    return {
      success: true,
      message: `Generated schedules for ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      details: {
        created: schedulesCreated,
        skipped: schedulesSkipped,
        total: activeAssignments.length
      }
    }
  } catch (error) {
    console.error('[v0] Error in generateSchedulesForDateRange:', error)
    throw error
  }
}

/**
 * Generate schedules for a single employee for a date range
 */
async function generateSchedulesForEmployee(
  assignment: any,
  startDate: Date,
  endDate: Date
) {
  let created = 0
  let skipped = 0

  const currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)

  while (currentDate <= endDate) {
    try {
      // Check if schedule already exists for this date
      const existingSchedule = await prisma.schedule.findUnique({
        where: {
          employeeId_scheduleDate: {
            employeeId: assignment.userId,
            scheduleDate: new Date(currentDate)
          }
        }
      })

      if (!existingSchedule) {
        // Calculate what shift this employee should work on this date
        const shiftInfo = await getShiftForDate(assignment, currentDate)

        if (shiftInfo) {
          // Create schedule record
          await prisma.schedule.create({
            data: {
              employeeId: assignment.userId,
              shiftId: shiftInfo.shiftId,
              scheduleDate: new Date(currentDate),
              shiftStart: shiftInfo.shiftStart,
              shiftEnd: shiftInfo.shiftEnd,
              isException: false,
              notes: `Generated from ${assignment.pattern.type} pattern`
            }
          })
          created++
        } else {
          skipped++
        }
      } else {
        skipped++
      }
    } catch (err) {
      console.error('[v0] Error creating schedule for', currentDate, ':', err)
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return { created, skipped }
}

/**
 * Calculate which shift an employee should work on a given date
 */
async function getShiftForDate(assignment: any, date: Date) {
  const pattern = assignment.pattern

  if (pattern.type === 'FIXED') {
    // For FIXED patterns: check if this day of week matches working days
    const dayOfWeek = date.getDay()
    const workingDays = pattern.workingDays ? JSON.parse(pattern.workingDays) : []

    if (workingDays.includes(dayOfWeek)) {
      // Get the shift
      const shift = await prisma.shift.findUnique({
        where: { id: pattern.shiftId }
      })

      if (shift) {
        return {
          shiftId: shift.id,
          shiftStart: shift.startTime,
          shiftEnd: shift.endTime
        }
      }
    }
    return null
  }

  if (pattern.type === 'ROTATING') {
    const rotatingPattern = pattern.rotatingPattern ? JSON.parse(pattern.rotatingPattern) : null
    if (!rotatingPattern) return null

    const startDate = new Date(rotatingPattern.startDate)
    const diffTime = date.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    const cycleDays = rotatingPattern.sequence.reduce((sum: number, seq: any) => sum + seq.days, 0)
    const dayInCycle = ((diffDays % cycleDays) + cycleDays) % cycleDays

    let cumulative = 0
    for (const seq of rotatingPattern.sequence) {
      cumulative += seq.days
      if (dayInCycle < cumulative) {
        // Found the shift type for this day
        if (seq.shiftType === 'off') {
          return null // Day off, no schedule
        }

        // Look up the shift by type (need to find by name)
        const shift = await prisma.shift.findFirst({
          where: {
            name: { contains: seq.shiftType, mode: 'insensitive' }
          }
        })

        if (shift) {
          return {
            shiftId: shift.id,
            shiftStart: shift.startTime,
            shiftEnd: shift.endTime
          }
        }
        break
      }
    }
    return null
  }

  if (pattern.type === 'MODULO') {
    const moduloPattern = pattern.moduloPattern ? JSON.parse(pattern.moduloPattern) : null
    if (!moduloPattern) return null

    const startDate = new Date(moduloPattern.startDate)
    const diffTime = date.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    const cycleLength = moduloPattern.sequence.length
    const dayInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength
    const shiftType = moduloPattern.sequence[dayInCycle]

    if (shiftType === 'off') {
      return null // Day off
    }

    // Look up the shift by type
    const shift = await prisma.shift.findFirst({
      where: {
        name: { contains: shiftType, mode: 'insensitive' }
      }
    })

    if (shift) {
      return {
        shiftId: shift.id,
        shiftStart: shift.startTime,
        shiftEnd: shift.endTime
      }
    }
    return null
  }

  return null
}
