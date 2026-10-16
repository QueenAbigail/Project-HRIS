export type OvertimeType = 'overtime_weekly' | 'regular_backup' | 'national_holiday'

export interface OvertimeRule {
  id: string
  type: OvertimeType
  hour: number
  multiplier: number
  description: string
  status: 'active' | 'inactive'
}

export interface OvertimeRulesResponse {
  rules: OvertimeRule[]
}

export interface OvertimeRuleFormValues {
  hour: string
  multiplier: string
  description: string
}

export const overtimeTypeGroups: { id: OvertimeType; name: string; description: string }[] = [
  {
    id: 'overtime_weekly',
    name: 'Fixed OT',
    description: 'Overtime due to work hour rules (12-hour shifts exceeding 8-hour daily limit)',
  },
  {
    id: 'regular_backup',
    name: 'OT Replacement (BKO)',
    description: 'Overtime when personnel cannot attend and duty is replaced',
  },
  {
    id: 'national_holiday',
    name: 'OT at National Holiday',
    description: 'Overtime for personnel on duty during national holidays',
  },
]
