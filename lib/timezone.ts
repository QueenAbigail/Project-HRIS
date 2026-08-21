/**
 * Timezone utility for GMT+7 (Southeast Asia)
 * All time comparisons should use this for consistency
 */

export const BUSINESS_TIMEZONE = 'Asia/Jakarta'

const jakartaParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hourCycle: 'h23',
})

/** Return the current calendar date in the business timezone as YYYY-MM-DD. */
export function getBusinessDate(date = new Date()): string {
  const parts = Object.fromEntries(jakartaParts.formatToParts(date).map(({ type, value }) => [type, value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

/** Format a business date for Indonesian users as DD-MM-YYYY. */
export function formatBusinessDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return `${day}-${month}-${year}`
}

/** Parse date-only input without JavaScript's UTC date-only interpretation. */
export function parseBusinessDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

export function getBusinessDateRange(dateFrom: string, dateTo = dateFrom) {
  return {
    from: parseBusinessDate(dateFrom),
    to: new Date(parseBusinessDate(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1),
  }
}

export function getBusinessDateRangeForPreset(preset: string, today = getBusinessDate()) {
  const current = parseBusinessDate(today)
  const start = new Date(current)
  const end = new Date(current)
  const weekday = current.getUTCDay()

  if (preset === 'yesterday') {
    start.setUTCDate(start.getUTCDate() - 1)
    end.setUTCDate(end.getUTCDate() - 1)
  } else if (preset === 'week') {
    start.setUTCDate(start.getUTCDate() - (weekday === 0 ? 6 : weekday - 1))
  } else if (preset === 'month') {
    start.setUTCDate(1)
  }

  const toDate = (value: Date) => value.toISOString().slice(0, 10)
  return { dateFrom: toDate(start), dateTo: toDate(end) }
}

export function getBusinessDateTime(date = new Date()): string {
  const parts = Object.fromEntries(jakartaParts.formatToParts(date).map(({ type, value }) => [type, value]))
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`
}

/** Return UTC date bounds built from the current calendar date in Asia/Jakarta. */
export function getBusinessDateBounds(date = new Date()) {
  const businessDate = getBusinessDate(date)
  const start = parseBusinessDate(businessDate)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)

  const weekAgo = new Date(start)
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)

  const monthStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
  const monthEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1))

  return { todayStart: start, todayEnd: end, weekAgo, monthStart, monthEnd }
}

/** Backwards-compatible GMT+7 helpers. */
export function getCurrentTimeGMT7(): Date { return new Date() }
export function toGMT7(date: Date): Date { return date }


/**
 * Parse a date string (YYYY-MM-DD) as a local date in GMT+7
 * This ensures the date is treated as a local date, not UTC
 */
export function parseLocalDate(dateString: string): Date {
  return parseBusinessDate(dateString)
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
