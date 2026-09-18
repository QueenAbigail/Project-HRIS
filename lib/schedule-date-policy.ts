export function getDateOnlyInLocalTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(`${value.slice(0, 10)}T00:00:00`) : new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

export function isTodayOrEarlier(value: string | Date) {
  const date = getDateOnlyInLocalTime(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date <= today
}

export function protectedDateMessage(date?: string | Date) {
  return `Schedules for today or earlier are protected and cannot be changed by import or bulk operations${date ? ` (${getDateOnlyInLocalTime(date).toISOString().slice(0, 10)})` : ''}.`
}
