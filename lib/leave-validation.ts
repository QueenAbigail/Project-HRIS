import { SchedulePattern, Shift } from '@prisma/client'

interface DayBreakdown {
  date: string
  dayOfWeek: string
  isWorking: boolean
  reason?: string
}

interface WorkingDaysResult {
  workingDaysCount: number
  totalDays: number
  breakdown: DayBreakdown[]
  summary: string
}

/**
 * Calculate working days for FIXED patterns
 * FIXED patterns are Mon-Fri, so weekends are OFF
 * (Public holidays handled separately via API)
 */
function calculateFixedPatternDays(
  startDate: Date,
  endDate: Date
): WorkingDaysResult {
  const breakdown: DayBreakdown[] = []
  let workingDaysCount = 0

  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    const dayOfWeek = current.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = current.toISOString().split('T')[0]
    const dayNum = current.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

    const isWeekday = dayNum >= 1 && dayNum <= 5 // Mon-Fri
    const isWorking = isWeekday

    if (isWorking) {
      workingDaysCount++
    }

    breakdown.push({
      date: dateStr,
      dayOfWeek,
      isWorking,
      reason: isWeekday ? undefined : 'Weekend - not counted',
    })

    current.setDate(current.getDate() + 1)
  }

  const totalDays = breakdown.length
  const skippedDays = breakdown.filter((d) => !d.isWorking).length
  const summary =
    skippedDays > 0
      ? `${workingDaysCount} working days (${skippedDays} weekend/holiday days skipped)`
      : `${workingDaysCount} working days`

  return { workingDaysCount, totalDays, breakdown, summary }
}

/**
 * Calculate working days for ROTATING patterns
 * Rotating patterns cycle through shifts, so we check if day has a shift assigned
 */
function calculateRotatingPatternDays(
  startDate: Date,
  endDate: Date,
  pattern: SchedulePattern,
  shifts: Record<string, Shift>
): WorkingDaysResult {
  const breakdown: DayBreakdown[] = []
  let workingDaysCount = 0

  // Parse rotating pattern
  const rotatingData = pattern.rotatingPattern as any
  if (!rotatingData || !rotatingData.sequence) {
    throw new Error('Invalid rotating pattern configuration')
  }

  const sequence = rotatingData.sequence // [{ days: 2, shiftType: 'morning' }, ...]
  const patternStartDate = new Date(rotatingData.startDate)
  let sequenceIndex = 0
  let daysInCurrentSegment = 0
  let dayCounter = 0

  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  // Calculate which position in sequence the start date falls on
  const daysFromPatternStart = Math.floor(
    (startDate.getTime() - patternStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  let daysPassed = 0
  for (let i = 0; i < sequence.length; i++) {
    const segmentDays = sequence[i].days
    if (daysPassed + segmentDays > daysFromPatternStart) {
      sequenceIndex = i
      daysInCurrentSegment = daysFromPatternStart - daysPassed
      break
    }
    daysPassed += segmentDays
  }

  while (current <= end) {
    const dayOfWeek = current.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = current.toISOString().split('T')[0]

    const currentSegment = sequence[sequenceIndex]
    const isWorking = currentSegment.days > 0 // If segment has days, it's a working period

    if (isWorking) {
      workingDaysCount++
    }

    breakdown.push({
      date: dateStr,
      dayOfWeek,
      isWorking,
      reason: isWorking ? undefined : `Off period (${currentSegment.label || 'rest days'})`,
    })

    // Move to next day
    daysInCurrentSegment++
    if (daysInCurrentSegment >= currentSegment.days) {
      sequenceIndex = (sequenceIndex + 1) % sequence.length
      daysInCurrentSegment = 0
    }

    current.setDate(current.getDate() + 1)
  }

  const totalDays = breakdown.length
  const skippedDays = breakdown.filter((d) => !d.isWorking).length
  const summary =
    skippedDays > 0
      ? `${workingDaysCount} working days (${skippedDays} off days skipped)`
      : `${workingDaysCount} working days`

  return { workingDaysCount, totalDays, breakdown, summary }
}

/**
 * Calculate working days for MODULO patterns
 * Modulo patterns cycle through a sequence of shift types
 */
function calculateModuloPatternDays(
  startDate: Date,
  endDate: Date,
  pattern: SchedulePattern
): WorkingDaysResult {
  const breakdown: DayBreakdown[] = []
  let workingDaysCount = 0

  // Parse modulo pattern
  const moduloData = pattern.moduloPattern as any
  if (!moduloData || !moduloData.sequence) {
    throw new Error('Invalid modulo pattern configuration')
  }

  const sequence = moduloData.sequence // ['morning', 'morning', 'night', 'night', 'off', ...]
  const patternStartDate = new Date(moduloData.startDate)

  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  // Calculate which position in sequence the start date falls on
  const daysFromPatternStart = Math.floor(
    (startDate.getTime() - patternStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const startSequenceIndex = daysFromPatternStart % sequence.length

  let sequenceIndex = startSequenceIndex

  while (current <= end) {
    const dayOfWeek = current.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = current.toISOString().split('T')[0]

    const shiftType = sequence[sequenceIndex]
    const isWorking = shiftType && shiftType.toLowerCase() !== 'off'

    if (isWorking) {
      workingDaysCount++
    }

    breakdown.push({
      date: dateStr,
      dayOfWeek,
      isWorking,
      reason: isWorking ? undefined : `${shiftType} - not counted`,
    })

    // Move to next position in sequence
    sequenceIndex = (sequenceIndex + 1) % sequence.length
    current.setDate(current.getDate() + 1)
  }

  const totalDays = breakdown.length
  const skippedDays = breakdown.filter((d) => !d.isWorking).length
  const summary =
    skippedDays > 0
      ? `${workingDaysCount} working days (${skippedDays} off days skipped)`
      : `${workingDaysCount} working days`

  return { workingDaysCount, totalDays, breakdown, summary }
}

/**
 * Main function: Calculate working days based on employee's pattern type
 */
export async function calculateWorkingDaysForLeave(
  startDate: Date,
  endDate: Date,
  pattern: SchedulePattern
): Promise<WorkingDaysResult> {
  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date')
  }

  if (pattern.type === 'FIXED') {
    return calculateFixedPatternDays(startDate, endDate)
  } else if (pattern.type === 'ROTATING') {
    return calculateRotatingPatternDays(startDate, endDate, pattern, {})
  } else if (pattern.type === 'MODULO') {
    return calculateModuloPatternDays(startDate, endDate, pattern)
  } else {
    throw new Error(`Unknown pattern type: ${pattern.type}`)
  }
}

/**
 * Utility to format breakdown for display
 */
export function formatDayBreakdown(breakdown: DayBreakdown[]): string {
  const working = breakdown.filter((d) => d.isWorking).map((d) => d.date)
  const skipped = breakdown.filter((d) => !d.isWorking).map((d) => d.date)

  let result = ''
  if (working.length > 0) {
    result += `Counted: ${working.join(', ')}`
  }
  if (skipped.length > 0) {
    if (result) result += '\n'
    result += `Skipped: ${skipped.join(', ')}`
  }
  return result
}
