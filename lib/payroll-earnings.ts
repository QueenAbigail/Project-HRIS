import { z } from 'zod'
import type { EarningCalculationType, PayrollEarning } from '@prisma/client'
import { firstOfMonth, fromDbDate } from '@/lib/salary-base'

export const EARNING_CALCULATION_TYPES = ['fixed_monthly', 'per_attendance_day', 'per_shift'] as const

export const EARNING_CALCULATION_LABELS: Record<EarningCalculationType, string> = {
  fixed_monthly: 'Fixed Monthly',
  per_attendance_day: 'Per Attendance Day',
  per_shift: 'Per Shift',
}

export const EARNING_UNIT_LABELS: Record<EarningCalculationType, string> = {
  fixed_monthly: '/ month',
  per_attendance_day: '/ day',
  per_shift: '/ shift',
}

export const payrollEarningCreateSchema = z.object({
  companyId: z.string().min(1, 'Client is required'),
  siteId: z.string().optional().nullable(),
  positionId: z.string().optional().nullable(),
  name: z
    .string()
    .trim()
    .min(1, 'Earning name is required')
    .max(80, 'Earning name is too long'),
  calculationType: z.enum(EARNING_CALCULATION_TYPES),
  amount: z
    .number()
    .finite()
    .int('Amount must be a whole number')
    .min(0, 'Amount cannot be negative')
    .max(1_000_000_000, 'Amount is too large'),
  isTaxable: z.boolean().default(true),
})

export const payrollEarningUpdateSchema = z.object({
  groupId: z.string().min(1, 'Earning rule is required'),
  calculationType: z.enum(EARNING_CALCULATION_TYPES),
  amount: z
    .number()
    .finite()
    .int('Amount must be a whole number')
    .min(0, 'Amount cannot be negative')
    .max(1_000_000_000, 'Amount is too large'),
  isTaxable: z.boolean(),
})

export const payrollEarningStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
})

export function buildEarningGroupKey(
  companyId: string,
  siteId: string | null,
  positionId: string | null,
  name: string,
) {
  return [companyId, siteId ?? '*', positionId ?? '*', name.trim().toLowerCase()].join('::')
}

export type EarningWithRelations = PayrollEarning & {
  site: { id: string; name: string; code: string } | null
  position: { id: string; value: string } | null
}

function toVersion(row: EarningWithRelations) {
  return {
    id: row.id,
    calculationType: row.calculationType,
    amount: Number(row.amount),
    isTaxable: row.isTaxable,
    effectiveFrom: fromDbDate(row.effectiveFrom),
    effectiveTo: row.effectiveTo ? fromDbDate(row.effectiveTo) : null,
    status: row.status === 'inactive' ? ('inactive' as const) : ('active' as const),
  }
}

export function summarizeEarningsForCompany(rows: EarningWithRelations[], today: string) {
  const buckets = new Map<string, EarningWithRelations[]>()

  for (const row of rows) {
    const key = buildEarningGroupKey(row.companyId, row.siteId, row.positionId, row.name)
    const list = buckets.get(key) ?? []
    list.push(row)
    buckets.set(key, list)
  }

  return [...buckets.entries()]
    .map(([key, groupRows]) => {
      const sorted = [...groupRows].sort((a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime())
      let current: EarningWithRelations | null = null
      let scheduled: EarningWithRelations | null = null

      for (const row of sorted) {
        if (fromDbDate(row.effectiveFrom) <= today) current = row
        else if (!scheduled) scheduled = row
      }

      const representative = current ?? scheduled ?? sorted[0]
      const status = representative.status === 'inactive' ? ('inactive' as const) : ('active' as const)

      return {
        key,
        representativeId: representative.id,
        companyId: representative.companyId,
        siteId: representative.siteId,
        siteName: representative.site?.name ?? null,
        siteCode: representative.site?.code ?? null,
        positionId: representative.positionId,
        positionName: representative.position?.value ?? null,
        name: representative.name,
        status,
        current: current ? toVersion(current) : null,
        scheduled: scheduled ? toVersion(scheduled) : null,
        pendingEffectiveDate: firstOfMonth(today, current ? 1 : 0),
      }
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
}
