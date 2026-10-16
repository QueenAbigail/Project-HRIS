import { z } from 'zod'
import type { SalaryBase } from '@prisma/client'

const PAYROLL_TIME_ZONE = 'Asia/Jakarta'

export const salaryBaseInputSchema = z.object({
  siteId: z.string().min(1, 'Site is required'),
  minimumWage: z
    .number()
    .finite()
    .int('Minimum wage must be a whole number')
    .positive('Minimum wage must be greater than 0')
    .max(1_000_000_000, 'Minimum wage is too large'),
})

export function todayInJakarta(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PAYROLL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function firstOfMonth(today: string, monthOffset = 0) {
  const [year, month] = today.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1 + monthOffset, 1)).toISOString().slice(0, 10)
}

export const toDbDate = (value: string) => new Date(`${value}T00:00:00.000Z`)
export const fromDbDate = (value: Date) => value.toISOString().slice(0, 10)

type SiteWithBases = {
  id: string
  name: string
  code: string
  salaryBases: SalaryBase[]
}

export function summarizeSiteWage(site: SiteWithBases, today: string) {
  const rows = [...site.salaryBases].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

  let current: SalaryBase | null = null
  let scheduled: SalaryBase | null = null
  for (const row of rows) {
    if (fromDbDate(row.effectiveDate) <= today) current = row
    else if (!scheduled) scheduled = row
  }

  // A site's first wage applies immediately; later changes start the month after.
  const pendingEffectiveDate = firstOfMonth(today, current ? 1 : 0)

  return {
    siteId: site.id,
    siteName: site.name,
    siteCode: site.code,
    current: current
      ? { id: current.id, minimumWage: Number(current.minimumWage), effectiveDate: fromDbDate(current.effectiveDate) }
      : null,
    scheduled: scheduled
      ? { id: scheduled.id, minimumWage: Number(scheduled.minimumWage), effectiveDate: fromDbDate(scheduled.effectiveDate) }
      : null,
    pendingEffectiveDate,
  }
}
