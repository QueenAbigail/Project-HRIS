import { z } from 'zod'
import { DeductionCalculationType, DeductionType } from '@prisma/client'
import type { DeductionRule } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const ALL_SCOPE = 'ALL'

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')

export const deductionRuleInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    type: z.nativeEnum(DeductionType),
    deductionType: z.nativeEnum(DeductionCalculationType),
    value: z.number().finite().min(0).max(9999.9999),
    positionId: z.string().trim().min(1, 'Position is required').max(100),
    siteId: z.string().trim().min(1, 'Site is required').max(100),
    riskLevel: z.enum(['low', 'medium', 'high']).nullable().optional(),
    effectiveDate: dateString,
    endDate: dateString.nullable().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
  })
  .superRefine((data, ctx) => {
    if (data.deductionType === 'percentage' && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Percentage cannot exceed 100',
      })
    }
    if (data.endDate && data.endDate < data.effectiveDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be on or after the effective date',
      })
    }
  })

export type DeductionRuleInput = z.infer<typeof deductionRuleInputSchema>

export function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function serializeDeductionRule(rule: DeductionRule) {
  return {
    id: rule.id,
    positionId: rule.positionId,
    siteId: rule.siteId,
    name: rule.name,
    type: rule.type,
    deductionType: rule.deductionType,
    value: Number(rule.value),
    riskLevel: rule.riskLevel,
    effectiveDate: toDateString(rule.effectiveDate),
    endDate: rule.endDate ? toDateString(rule.endDate) : null,
    status: rule.status,
  }
}

export async function validateScope(positionId: string, siteId: string) {
  if (positionId !== ALL_SCOPE) {
    const position = await prisma.masterData.findFirst({
      where: { category: 'position', value: positionId, isActive: true },
      select: { id: true },
    })
    if (!position) return 'Selected position does not exist'
  }

  if (siteId !== ALL_SCOPE) {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    })
    if (!site) return 'Selected site does not exist'
  }

  return null
}
