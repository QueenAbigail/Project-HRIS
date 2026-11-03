import { z } from 'zod'
import { OvertimeRuleType } from '@prisma/client'
import type { OvertimeRule } from '@prisma/client'

export function ordinalHour(hour: number) {
  const mod100 = hour % 100
  if (mod100 >= 11 && mod100 <= 13) return `${hour}th`
  switch (hour % 10) {
    case 1: return `${hour}st`
    case 2: return `${hour}nd`
    case 3: return `${hour}rd`
    default: return `${hour}th`
  }
}

export const overtimeRuleInputSchema = z.object({
  type: z.nativeEnum(OvertimeRuleType),
  hour: z.number().int('Hour must be a whole number').min(1, 'Hour must be at least 1').max(24, 'Hour cannot exceed 24'),
  multiplier: z.number().finite().min(0.01, 'Multiplier must be greater than 0').max(9.99, 'Multiplier cannot exceed 9.99'),
  description: z.string().trim().max(200).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type OvertimeRuleInput = z.infer<typeof overtimeRuleInputSchema>

export function toOvertimeRuleData(input: OvertimeRuleInput) {
  return {
    type: input.type,
    hour: input.hour,
    multiplier: Math.round(input.multiplier * 100) / 100,
    description: input.description || `${ordinalHour(input.hour)} hour`,
    status: input.status,
  }
}

export function serializeOvertimeRule(rule: OvertimeRule) {
  return {
    id: rule.id,
    type: rule.type,
    hour: rule.hour,
    multiplier: Number(rule.multiplier),
    description: rule.description,
    status: rule.status,
  }
}
