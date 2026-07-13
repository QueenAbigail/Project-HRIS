import { prisma } from '@/lib/prisma'

/**
 * Apply a shift swap by updating Schedule records
 * When two employees swap shifts, both their Schedule records are updated
 */
export async function applyShiftSwapToSchedules(
  employeeFromId: string,
  employeeToId: string,
  swapDate: Date
): Promise<{ success: boolean; message: string }> {
  try {
    const dateOnly = new Date(swapDate)
    dateOnly.setHours(0, 0, 0, 0)

    console.log('[v0] Applying shift swap to schedules:', {
      employeeFromId,
      employeeToId,
      swapDate: dateOnly.toISOString().split('T')[0]
    })

    // Get both employees' schedules for this date
    const fromSchedule = await prisma.schedule.findUnique({
      where: {
        employeeId_scheduleDate: {
          employeeId: employeeFromId,
          scheduleDate: dateOnly
        }
      }
    })

    const toSchedule = await prisma.schedule.findUnique({
      where: {
        employeeId_scheduleDate: {
          employeeId: employeeToId,
          scheduleDate: dateOnly
        }
      }
    })

    if (!fromSchedule || !toSchedule) {
      return {
        success: false,
        message: 'One or both employees do not have schedules for this date'
      }
    }

    // Swap the shift assignments
    await Promise.all([
      prisma.schedule.update({
        where: {
          id: fromSchedule.id
        },
        data: {
          shiftId: toSchedule.shiftId,
          shiftStart: toSchedule.shiftStart,
          shiftEnd: toSchedule.shiftEnd,
          isException: true,
          notes: `Swapped with ${employeeToId}`
        }
      }),
      prisma.schedule.update({
        where: {
          id: toSchedule.id
        },
        data: {
          shiftId: fromSchedule.shiftId,
          shiftStart: fromSchedule.shiftStart,
          shiftEnd: fromSchedule.shiftEnd,
          isException: true,
          notes: `Swapped with ${employeeFromId}`
        }
      })
    ])

    console.log('[v0] Shift swap applied successfully')
    return {
      success: true,
      message: 'Shift swap applied to schedules'
    }
  } catch (error) {
    console.error('[v0] Error applying shift swap:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to apply shift swap'
    }
  }
}

interface SwappedSchedule {
  isSwapped: boolean
  swappedWithEmployeeId?: string
  swappedWithEmployeeName?: string
  originalScheduledStart: string | null
  originalScheduledEnd: string | null
  swappedScheduledStart: string | null
  swappedScheduledEnd: string | null
}

/**
 * Check if employee has an approved shift swap for a given date
 * If yes, return the swapped schedule details
 */
export async function getSwappedScheduleIfExists(
  userId: string,
  date: Date,
  originalShiftId: string | null,
  originalScheduledStart: string | null,
  originalScheduledEnd: string | null
): Promise<SwappedSchedule> {
  const swapDate = new Date(date)
  swapDate.setHours(0, 0, 0, 0)

  try {
    // Check if there's an approved swap for this employee on this date
    const approvedSwap = await prisma.shiftSwap.findFirst({
      where: {
        swapDate: swapDate,
        status: 'Approved',
        OR: [
          { employeeFromId: userId },
          { employeeToId: userId },
        ],
      },
      include: {
        employeeFrom: { select: { id: true, name: true } },
        employeeTo: { select: { id: true, name: true } },
      },
    })

    if (!approvedSwap) {
      // No swap, return original schedule
      return {
        isSwapped: false,
        originalScheduledStart,
        originalScheduledEnd,
        swappedScheduledStart: null,
        swappedScheduledEnd: null,
      }
    }

    // Determine who the employee is swapping with
    const isSwappingFrom = approvedSwap.employeeFromId === userId
    const swappedWithEmployee = isSwappingFrom
      ? approvedSwap.employeeTo
      : approvedSwap.employeeFrom

    // Get the swapped-with employee's original shift for this date
    const swappedWithAssignment = await prisma.employeePatternAssignment.findFirst({
      where: {
        userId: swappedWithEmployee.id,
        status: 'ACTIVE',
        startDate: { lte: swapDate },
        OR: [{ endDate: null }, { endDate: { gte: swapDate } }],
      },
      include: {
        pattern: true,
      },
    })

    let swappedScheduledStart: string | null = null
    let swappedScheduledEnd: string | null = null

    if (swappedWithAssignment) {
      const pattern = swappedWithAssignment.pattern
      const dayOfWeek = swapDate.getDay()
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      if (pattern.type === 'FIXED' && pattern.shiftId) {
        const shift = await prisma.shift.findUnique({
          where: { id: pattern.shiftId },
        })
        if (shift) {
          swappedScheduledStart = shift.startTime
          swappedScheduledEnd = shift.endTime
        }
      } else if (pattern.type === 'ROTATING') {
        const rotatingData = pattern.rotatingPattern as any
        if (rotatingData?.sequence && rotatingData?.startDate) {
          const patternStartDate = new Date(rotatingData.startDate)
          const daysFromStart = Math.floor(
            (swapDate.getTime() - patternStartDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          const sequenceIndex = daysFromStart % rotatingData.sequence.length
          const currentCycle = rotatingData.sequence[sequenceIndex]

          if (currentCycle.shiftType && currentCycle.shiftType !== 'off') {
            const shift = await prisma.shift.findUnique({
              where: { id: currentCycle.shiftType },
            })
            if (shift) {
              swappedScheduledStart = shift.startTime
              swappedScheduledEnd = shift.endTime
            }
          }
        }
      } else if (pattern.type === 'MODULO') {
        const moduloData = pattern.moduloPattern as any
        if (moduloData?.sequence && moduloData?.startDate) {
          const patternStartDate = new Date(moduloData.startDate)
          const daysFromStart = Math.floor(
            (swapDate.getTime() - patternStartDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          const sequenceIndex = daysFromStart % moduloData.sequence.length
          const currentShiftType = moduloData.sequence[sequenceIndex]

          if (currentShiftType && currentShiftType !== 'rest' && currentShiftType !== 'OFF') {
            const shift = await prisma.shift.findUnique({
              where: { id: currentShiftType },
            })
            if (shift) {
              swappedScheduledStart = shift.startTime
              swappedScheduledEnd = shift.endTime
            }
          }
        }
      }
    }

    console.log('[v0] Shift swap found:', {
      userId,
      swapDate,
      swappedWithEmployeeId: swappedWithEmployee.id,
      swappedWithEmployeeName: swappedWithEmployee.name,
      originalSchedule: { start: originalScheduledStart, end: originalScheduledEnd },
      swappedSchedule: { start: swappedScheduledStart, end: swappedScheduledEnd },
    })

    return {
      isSwapped: true,
      swappedWithEmployeeId: swappedWithEmployee.id,
      swappedWithEmployeeName: swappedWithEmployee.name,
      originalScheduledStart,
      originalScheduledEnd,
      swappedScheduledStart,
      swappedScheduledEnd,
    }
  } catch (error) {
    console.error('[v0] Error checking shift swap:', error)
    // On error, return original schedule
    return {
      isSwapped: false,
      originalScheduledStart,
      originalScheduledEnd,
      swappedScheduledStart: null,
      swappedScheduledEnd: null,
    }
  }
}
