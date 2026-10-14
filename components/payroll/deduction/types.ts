export type DeductionType = 'tax' | 'insurance' | 'health' | 'pension' | 'special'
export type DeductionCalculationType = 'percentage' | 'fixed_amount'
export type RuleStatus = 'active' | 'inactive'
export type RiskLevel = 'low' | 'medium' | 'high'

export const ALL_SCOPE = 'ALL'

export interface DeductionRule {
  id: string
  positionId: string
  siteId: string
  name: string
  type: DeductionType
  deductionType: DeductionCalculationType
  value: number
  riskLevel: RiskLevel | null
  effectiveDate: string
  endDate: string | null
  status: RuleStatus
}

export interface SiteOption {
  id: string
  name: string
  code: string
}

export interface DeductionRulesResponse {
  rules: DeductionRule[]
  positions: string[]
  sites: SiteOption[]
}

export interface DeductionRuleFormValues {
  name: string
  type: DeductionType
  deductionType: DeductionCalculationType
  value: string
  positionId: string
  siteId: string
  riskLevel: RiskLevel | 'none'
  effectiveDate: string
  endDate: string
  status: RuleStatus
}

export const deductionTypeGroups: {
  id: DeductionType
  name: string
  description: string
  color: string
}[] = [
  {
    id: 'tax',
    name: 'Tax',
    description: 'Income tax and government levies',
    color: 'text-red-600 dark:text-red-400',
  },
  {
    id: 'insurance',
    name: 'Social Insurance',
    description: 'BPJS and employment insurance',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'health',
    name: 'Health Insurance',
    description: 'Health insurance contributions',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'pension',
    name: 'Pension',
    description: 'Pension and retirement funds',
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'special',
    name: 'Special',
    description: 'Debts and other special deductions',
    color: 'text-purple-600 dark:text-purple-400',
  },
]
