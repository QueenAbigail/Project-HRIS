export type DeductionType = 'tax' | 'insurance' | 'health' | 'pension' | 'special'
export type DeductionCalculationType = 'percentage' | 'fixed_amount'
export type RuleStatus = 'active' | 'inactive'

export interface DeductionRule {
  id: string
  name: string
  type: DeductionType
  deductionType: DeductionCalculationType
  value: number
  status: RuleStatus
}

export interface DeductionRulesResponse {
  rules: DeductionRule[]
}

export interface DeductionRuleFormValues {
  name: string
  type: DeductionType
  deductionType: DeductionCalculationType
  value: string
  status: RuleStatus
}

export const deductionTypeGroups: {
  id: DeductionType
  name: string
  description: string
  color: string
}[] = [
  { id: 'tax', name: 'Tax', description: 'Income tax and government levies', color: 'text-red-600 dark:text-red-400' },
  { id: 'insurance', name: 'Social Insurance', description: 'BPJS and employment insurance', color: 'text-blue-600 dark:text-blue-400' },
  { id: 'health', name: 'Health Insurance', description: 'Health insurance contributions', color: 'text-green-600 dark:text-green-400' },
  { id: 'pension', name: 'Pension', description: 'Pension and retirement funds', color: 'text-amber-600 dark:text-amber-400' },
  { id: 'special', name: 'Special', description: 'Debts and other special deductions', color: 'text-purple-600 dark:text-purple-400' },
]

export interface SiteOption {
  id: string
  name: string
  code: string
}

export const ALL_SCOPE = 'ALL'

export interface DeductionAssignment {
  id: string
  deductionRuleId: string
  siteId: string
  site: SiteOption
}

export interface DeductionAssignmentsResponse {
  assignments: DeductionAssignment[]
  sites: SiteOption[]
}

export interface DeductionRulesResponseWithAssignments extends DeductionRulesResponse {
  assignments: DeductionAssignment[]
  sites: SiteOption[]
}

export interface DeductionAssignmentInput {
  deductionRuleId: string
  siteIds: string[]
}
