export type PayslipStatus = 'sent' | 'not-sent'

export interface PayslipSite {
  id: string
  name: string
  location: string
}

export interface PayslipRecord {
  id: string
  siteId: string
  name: string
  initials: string
  department: string
  /** Employee join date (yyyy-mm-dd), printed as TMT on the payslip. */
  joinDate: string
  daysWorked: number
  totalDays: number
  dailyRate: number
  baseSalary: number
  overtimeHours: number
  overtimeRate: number
  overtime: number
  bonus: number
  allowances: number
  extraFooding: number
  taxDeduction: number
  bpjsKesDeduction: number
  bpjsTkDeduction: number
  otherDeductions: number
  deductions: number
  netPay: number
  status: PayslipStatus
}

type RawPayslip = Omit<PayslipRecord, 'deductions' | 'netPay' | 'joinDate'>

const joinDates: Record<string, string> = {
  EMP001: '2021-03-15',
  EMP002: '2021-08-02',
  EMP003: '2022-01-10',
  EMP004: '2022-06-20',
  EMP005: '2023-02-01',
  EMP006: '2023-07-17',
  EMP007: '2024-01-08',
  EMP008: '2024-05-13',
  EMP009: '2025-02-03',
}

export const payslipPeriods = ['March 2026', 'February 2026', 'January 2026']

export const payslipSites: PayslipSite[] = [
  { id: 'S1', name: 'Head Office', location: 'Jakarta' },
  { id: 'S2', name: 'Regional Office', location: 'Surabaya' },
  { id: 'S3', name: 'Branch Office', location: 'Bandung' },
]

export function getGross(
  record: Pick<PayslipRecord, 'baseSalary' | 'overtime' | 'bonus' | 'allowances' | 'extraFooding'>,
) {
  return record.baseSalary + record.overtime + record.bonus + record.allowances + record.extraFooding
}

/** Mock payroll values are stored in thousands of rupiah; display full rupiah amounts. */
export function formatPayslipAmount(amount: number) {
  return `Rp ${(amount * 1000).toLocaleString('id-ID')}`
}

function build(raw: RawPayslip): PayslipRecord {
  const deductions =
    raw.taxDeduction + raw.bpjsKesDeduction + raw.bpjsTkDeduction + raw.otherDeductions
  return { ...raw, joinDate: joinDates[raw.id] ?? '', deductions, netPay: getGross(raw) - deductions }
}

const rawRecords: RawPayslip[] = [
  {
    id: 'EMP001', siteId: 'S1', name: 'Michael Chen', initials: 'MC', department: 'Field Security',
    daysWorked: 22, totalDays: 22, dailyRate: 127.27, baseSalary: 2800,
    overtimeHours: 18, overtimeRate: 25, overtime: 450, bonus: 0, allowances: 150,
    extraFooding: 100,
    taxDeduction: 150, bpjsKesDeduction: 20, bpjsTkDeduction: 60, otherDeductions: 50, status: 'sent',
  },
  {
    id: 'EMP002', siteId: 'S1', name: 'Sarah Williams', initials: 'SW', department: 'Surveillance',
    daysWorked: 21, totalDays: 22, dailyRate: 118.18, baseSalary: 2600,
    overtimeHours: 12.8, overtimeRate: 25, overtime: 320, bonus: 100, allowances: 100,
    extraFooding: 0,
    taxDeduction: 140, bpjsKesDeduction: 20, bpjsTkDeduction: 60, otherDeductions: 40, status: 'sent',
  },
  {
    id: 'EMP003', siteId: 'S1', name: 'David Rodriguez', initials: 'DR', department: 'Patrol',
    daysWorked: 22, totalDays: 22, dailyRate: 145.45, baseSalary: 3200,
    overtimeHours: 23.2, overtimeRate: 25, overtime: 580, bonus: 200, allowances: 200,
    extraFooding: 120,
    taxDeduction: 160, bpjsKesDeduction: 25, bpjsTkDeduction: 75, otherDeductions: 60, status: 'not-sent',
  },
  {
    id: 'EMP004', siteId: 'S2', name: 'Emily Johnson', initials: 'EJ', department: 'Administration',
    daysWorked: 20, totalDays: 22, dailyRate: 159.09, baseSalary: 3500,
    overtimeHours: 0, overtimeRate: 0, overtime: 0, bonus: 300, allowances: 200,
    extraFooding: 0,
    taxDeduction: 175, bpjsKesDeduction: 25, bpjsTkDeduction: 75, otherDeductions: 75, status: 'sent',
  },
  {
    id: 'EMP005', siteId: 'S2', name: 'James Wilson', initials: 'JW', department: 'Field Security',
    daysWorked: 20, totalDays: 22, dailyRate: 109.09, baseSalary: 2400,
    overtimeHours: 15.2, overtimeRate: 25, overtime: 380, bonus: 50, allowances: 100,
    extraFooding: 0,
    taxDeduction: 120, bpjsKesDeduction: 20, bpjsTkDeduction: 60, otherDeductions: 40, status: 'sent',
  },
  {
    id: 'EMP006', siteId: 'S2', name: 'Robert Taylor', initials: 'RT', department: 'Patrol',
    daysWorked: 20, totalDays: 22, dailyRate: 100, baseSalary: 2200,
    overtimeHours: 0, overtimeRate: 0, overtime: 0, bonus: 0, allowances: 80,
    extraFooding: 0,
    taxDeduction: 110, bpjsKesDeduction: 20, bpjsTkDeduction: 60, otherDeductions: 30, status: 'not-sent',
  },
  {
    id: 'EMP007', siteId: 'S3', name: 'Anna Martinez', initials: 'AM', department: 'Surveillance',
    daysWorked: 22, totalDays: 22, dailyRate: 118.18, baseSalary: 2600,
    overtimeHours: 8, overtimeRate: 25, overtime: 200, bonus: 100, allowances: 100,
    extraFooding: 0,
    taxDeduction: 130, bpjsKesDeduction: 20, bpjsTkDeduction: 60, otherDeductions: 30, status: 'sent',
  },
  {
    id: 'EMP008', siteId: 'S3', name: 'Chris Anderson', initials: 'CA', department: 'Field Security',
    daysWorked: 22, totalDays: 22, dailyRate: 131.82, baseSalary: 2900,
    overtimeHours: 20, overtimeRate: 25, overtime: 500, bonus: 150, allowances: 150,
    extraFooding: 0,
    taxDeduction: 155, bpjsKesDeduction: 20, bpjsTkDeduction: 70, otherDeductions: 45, status: 'not-sent',
  },
  {
    id: 'EMP009', siteId: 'S3', name: 'Diana Turner', initials: 'DT', department: 'Administration',
    daysWorked: 21, totalDays: 22, dailyRate: 140.91, baseSalary: 3100,
    overtimeHours: 0, overtimeRate: 0, overtime: 0, bonus: 200, allowances: 180,
    extraFooding: 0,
    taxDeduction: 160, bpjsKesDeduction: 20, bpjsTkDeduction: 70, otherDeductions: 50, status: 'not-sent',
  },
]

export const payslipRecords: PayslipRecord[] = rawRecords.map(build)

export function getSite(siteId: string) {
  return payslipSites.find((site) => site.id === siteId)
}

export function getSiteRecords(siteId: string) {
  return payslipRecords.filter((record) => record.siteId === siteId)
}
