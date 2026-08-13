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
): string {
  if (!actualCheckIn) return 'NOT_CHECKED_IN'
  if (!scheduledStart) return 'PRESENT'
  return isLateCheckIn(actualCheckIn, scheduledStart) ? 'LATE' : 'PRESENT'
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
 * Rules (agreed with product):
 * - If the employee checked in, they are PRESENT (on time) or LATE. This is derived
 *   from the check-in itself so a stale stored status can never show them as Pending.
 *   Late = the record's precomputed lateMinutes > 0 (computed in GMT+7 at check-in),
 *   or the stored status already says LATE.
 * - If there is NO check-in, we trust the persisted status, which the `auto-absent`
 *   cron keeps fresh: LEAVE, ABSENT (past grace / shift end), or otherwise still
 *   NOT_CHECKED_IN (Pending). We never downgrade a cron-set ABSENT back to Pending.
 */
export function resolveAttendanceStatus(record: AttendanceRecordLike): ResolvedAttendanceStatus {
  const stored = (record.status || '').toUpperCase()

  if (record.actualCheckIn) {
    const isLate = (record.lateMinutes ?? 0) > 0 || stored === 'LATE'
    return isLate ? 'LATE' : 'PRESENT'
  }

  if (stored === 'LEAVE') return 'LEAVE'
  if (stored === 'ABSENT') return 'ABSENT'
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
  return expectedToWork > 0 ? Math.round(((present + late) / expectedToWork) * 100) : 100
}
