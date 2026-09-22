const EXPLICIT_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i

export function parseUtcTimestamp(value: unknown): Date | null {
  if (value == null || value === '') return null
  if (typeof value !== 'string' || !EXPLICIT_TIMEZONE_PATTERN.test(value.trim())) return null

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function hasExplicitTimezone(value: unknown): boolean {
  return typeof value === 'string' && EXPLICIT_TIMEZONE_PATTERN.test(value.trim())
}
