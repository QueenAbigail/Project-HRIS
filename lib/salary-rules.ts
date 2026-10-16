import { z } from 'zod'
import type { SalaryRule } from '@prisma/client'
import { firstOfMonth, fromDbDate } from '@/lib/salary-base'

export const salaryRuleInputSchema = z.object({
  siteId: z.string().min(1, 'Site is required'),
  positionId: z.string().min(1, 'Position is required'),
  positionAllowance: z
    .number()
    .finite()
    .int('Position allowance must be a whole number')
    .min(0, 'Position allowance cannot be negative')
    .max(1_000_000_000, 'Position allowance is too large'),
})

const toRecord = (rule: SalaryRule) => ({
  id: rule.id,
  positionAllowance: Number(rule.positionAllowance),
  effectiveDate: fromDbDate(rule.effectiveDate),
})

export function summarizeRules(rules: SalaryRule[], today: string) {
  const sorted = [...rules].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

  let current: SalaryRule | null = null
  let scheduled: SalaryRule | null = null
  for (const rule of sorted) {
    if (fromDbDate(rule.effectiveDate) <= today) current = rule
    else if (!scheduled) scheduled = rule
  }

  // A position's first allowance applies immediately; later changes start the month after.
  return {
    current: current ? toRecord(current) : null,
    scheduled: scheduled ? toRecord(scheduled) : null,
    pendingEffectiveDate: firstOfMonth(today, current ? 1 : 0),
  }
}
