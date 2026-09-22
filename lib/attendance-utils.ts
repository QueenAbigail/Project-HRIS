/**
 * Convert attendance status from database format to display format
 * Database: PRESENT, LATE, ABSENT, LEAVE, NOT_CHECKED_IN
 * Display: present, late, absent, leave, not-checked-in
 */
export function formatAttendanceStatus(status: string | null | undefined): string {
  if (!status) return 'not-checked-in'
  
  // Convert UPPERCASE_WITH_UNDERSCORES to lowercase-with-hyphens
  return status
    .toLowerCase()
    .replace(/_/g, '-')
}

/**
 * Get the label for an attendance status
 */
export function getAttendanceLabel(status: string | null | undefined): string {
  const statusMap: Record<string, string> = {
    'present': 'Present',
    'late': 'Late',
    'absent': 'Absent',
    'leave': 'On Leave',
    'not-checked-in': 'Pending',
    'day-off': 'Day Off',
  }
  
  const formatted = formatAttendanceStatus(status)
  return statusMap[formatted] || 'Unknown'
}

/**
 * Get CSS classes for status badge
 */
export function getStatusStyles(status: string | null | undefined): string {
  const stylesMap: Record<string, string> = {
    'present': 'bg-success/10 text-success border-success/20',
    'late': 'bg-warning/10 text-warning border-warning/20',
    'absent': 'bg-destructive/10 text-destructive border-destructive/20',
    'leave': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
    'not-checked-in': 'bg-muted text-muted-foreground border-muted',
    'day-off': 'bg-primary/10 text-primary/70 border-primary/20',
  }
  
  const formatted = formatAttendanceStatus(status)
  return stylesMap[formatted] || ''
}

/**
 * Determine if a status indicates the employee has checked in
 */
export function hasCheckedIn(status: string | null | undefined): boolean {
  const formatted = formatAttendanceStatus(status)
  return formatted !== 'not-checked-in' && formatted !== 'absent' && formatted !== 'leave'
}

/**
 * Calculate if check-in was late
 * @param checkInTime - Check-in time in "HH:MM" format or ISO string
 * @param scheduledTime - Scheduled start time in "HH:MM" format or ISO string
 */
export function isLateCheckIn(checkInTime: string | Date | null | undefined, scheduledTime: string | Date | null | undefined): boolean {
  if (!checkInTime || !scheduledTime) return false
  
  try {
    // Extract HH:MM from either "HH:MM", ISO datetime, or Date values
    const extractTime = (value: string | Date): number => {
      const timeStr = value instanceof Date ? value.toISOString() : value
      const match = timeStr.match(/(\d{1,2}):(\d{2})/)
      if (!match) return 0
      const hours = parseInt(match[1], 10)
      const minutes = parseInt(match[2], 10)
      return hours * 60 + minutes // Convert to minutes since midnight
    }
    
    const checkInMinutes = extractTime(checkInTime)
    const scheduledMinutes = extractTime(scheduledTime)
    
    return checkInMinutes > scheduledMinutes
  } catch (error) {
    console.error('[v0] Error determining if late:', error)
    return false
  }
}

/**
 * Calculate the canonical database status from check-in and scheduled times.
 * Used on the WRITE path (check-in) to persist the initial status.
 */
export function calculateAttendanceStatus(
  actualCheckIn: string | Date | null | undefined,
  scheduledStart: string | Date | null | undefined,
  siteTimezone?: string | null,
  gracePeriodMinutes = 0,
): string {
  if (!actualCheckIn) return 'NOT_CHECKED_IN'
  if (!scheduledStart) return 'PRESENT'

  const actualMinutes = getLocalMinutes(actualCheckIn, siteTimezone)
  const scheduledMinutes = getScheduledMinutes(scheduledStart)
  if (actualMinutes === null || scheduledMinutes === null) return 'PRESENT'

  return actualMinutes > scheduledMinutes + Math.max(0, gracePeriodMinutes) ? 'LATE' : 'PRESENT'
}

export function calculateLateMinutes(
  actualCheckIn: string | Date | null | undefined,
  scheduledStart: string | Date | null | undefined,
  siteTimezone?: string | null,
  gracePeriodMinutes = 0,
): number {
  if (!actualCheckIn || !scheduledStart) return 0
  const actualMinutes = getLocalMinutes(actualCheckIn, siteTimezone)
  const scheduledMinutes = getScheduledMinutes(scheduledStart)
  if (actualMinutes === null || scheduledMinutes === null) return 0
  return Math.max(0, actualMinutes - scheduledMinutes - Math.max(0, gracePeriodMinutes))
}

function getScheduledMinutes(value: string | Date): number | null {
  const match = (value instanceof Date ? value.toISOString() : value).match(/(\\d{1,2}):(\\d{2})/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function getLocalMinutes(value: string | Date, timezone?: string | null): number | null {
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return null
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone || 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const hour = parts.find((part) => part.type === 'hour')?.value
    const minute = parts.find((part) => part.type === 'minute')?.value
    return hour && minute ? Number(hour) * 60 + Number(minute) : null
  } catch {
    return null
  }
}

export type ResolvedAttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'NOT_CHECKED_IN'

/**
 * Minimal shape needed to resolve/tally an attendance record.
 */
export interface AttendanceRecordLike {
  actualCheckIn?: string | Date | null
  status?: string | null
  lateMinutes?: number | null
}

/**
 * SINGLE SOURCE OF TRUTH for how an attendance record's status is displayed/counted.
 *
 * The persisted database status is authoritative. `actualCheckIn` is the factual
 * timestamp, while status is the server-calculated classification. This prevents
 * the UI from showing Present when the database still says NOT_CHECKED_IN.
 */
export function resolveAttendanceStatus(record: AttendanceRecordLike): ResolvedAttendanceStatus {
  const stored = (record.status || '').toUpperCase()

  if (stored === 'PRESENT') return 'PRESENT'
  if (stored === 'LATE') return 'LATE'
  if (stored === 'ABSENT') return 'ABSENT'
  if (stored === 'LEAVE') return 'LEAVE'
  return 'NOT_CHECKED_IN'
}

export interface AttendanceTally {
  present: number
  late: number
  absent: number
  notCheckedIn: number
  onLeave: number
  totalLateMinutes: number
  averageLateMinutes: number
}

/**
 * Tally a set of attendance records into canonical counts.
 * Present and Late are mutually exclusive (Present = on-time only).
 */
export function tallyAttendance(records: AttendanceRecordLike[]): AttendanceTally {
  let present = 0
  let late = 0
  let absent = 0
  let notCheckedIn = 0
  let onLeave = 0
  let totalLateMinutes = 0

  for (const record of records) {
    const status = resolveAttendanceStatus(record)
    if (status === 'PRESENT') {
      present++
    } else if (status === 'LATE') {
      late++
      totalLateMinutes += record.lateMinutes ?? 0
    } else if (status === 'ABSENT') {
      absent++
    } else if (status === 'LEAVE') {
      onLeave++
    } else {
      notCheckedIn++
    }
  }

  return {
    present,
    late,
    absent,
    notCheckedIn,
    onLeave,
    totalLateMinutes,
    averageLateMinutes: late > 0 ? Math.round(totalLateMinutes / late) : 0,
  }
}

/**
 * Canonical attendance-rate formula. Late employees still attended, so they count
 * toward the rate even though the Present card only shows on-time arrivals.
 */
export function computeAttendanceRate(present: number, late: number, expectedToWork: number): number {
  if (expectedToWork <= 0) return 0

  return Math.min(100, Math.round(((present + late) / expectedToWork) * 100))
}
