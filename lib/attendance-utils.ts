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
 */
export function calculateAttendanceStatus(
  actualCheckIn: string | Date | null | undefined,
  scheduledStart: string | Date | null | undefined,
): string {
  if (!actualCheckIn) return 'NOT_CHECKED_IN'
  if (!scheduledStart) return 'PRESENT'
  return isLateCheckIn(actualCheckIn, scheduledStart) ? 'LATE' : 'PRESENT'
}
