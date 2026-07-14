/**
 * Timezone utility for GMT+7 (Southeast Asia)
 * All time comparisons should use this for consistency
 */

const TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000 // GMT+7 in milliseconds

/**
 * Get current time in GMT+7
 */
export function getCurrentTimeGMT7(): Date {
  const utcNow = new Date()
  return new Date(utcNow.getTime() + TIMEZONE_OFFSET_MS)
}

/**
 * Convert a date to GMT+7 timezone
 */
export function toGMT7(date: Date): Date {
  const utcTime = date.getTime()
  return new Date(utcTime + TIMEZONE_OFFSET_MS)
}

/**
 * Parse a date string (YYYY-MM-DD) as a local date in GMT+7
 * This ensures the date is treated as a local date, not UTC
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * Parse a time string (HH:MM) and create a Date object
 * combined with a date string (YYYY-MM-DD)
 */
export function parseLocalDateTime(dateString: string, timeString: string): Date {
  const date = parseLocalDate(dateString)
  const [hours, minutes] = timeString.split(':').map(Number)
  date.setHours(hours, minutes, 0, 0)
  return date
}
