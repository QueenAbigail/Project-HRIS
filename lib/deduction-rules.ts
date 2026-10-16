import { z } from 'zod'
import { DeductionCalculationType, DeductionType } from '@prisma/client'
import type { DeductionRule } from '@prisma/client'

export const deductionRuleInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    type: z.nativeEnum(DeductionType),
    deductionType: z.nativeEnum(DeductionCalculationType),
    value: z.number().finite().min(0).max(9999.9999),
    status: z.enum(['active', 'inactive']).default('active'),
  })
  .superRefine((data, ctx) => {
    if (data.deductionType === 'percentage' && data.value > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Percentage cannot exceed 100' })
    }
  })

export type DeductionRuleInput = z.infer<typeof deductionRuleInputSchema>

export function serializeDeductionRule(rule: DeductionRule) {
  return {
    id: rule.id,
    name: rule.name,
    type: rule.type,
    deductionType: rule.deductionType,
    value: Number(rule.value),
    status: rule.status,
  }
}

export function duplicateRuleError() {
  return 'A deduction rule with this name and category already exists'
}
