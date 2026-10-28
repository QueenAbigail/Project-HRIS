export type PayslipStatus = 'paid' | 'pending' | 'failed'

export interface PayslipRecord {
  id: string
  name: string
  initials: string
  department: string
  daysWorked: number
  totalDays: number
  dailyRate: number
  baseSalary: number
  overtimeHours: number
  overtimeRate: number
  overtime: number
  bonus: number
  allowances: number
  taxDeduction: number
  insuranceDeduction: number
  otherDeductions: number
  deductions: number
  netPay: number
  status: PayslipStatus
}

export const payslipPeriods = ['March 2026', 'February 2026', 'January 2026']

export const payslipRecords: PayslipRecord[] = [
  {
    id: 'EMP001',
    name: 'Michael Chen',
    initials: 'MC',
    department: 'Field Security',
    daysWorked: 22,
    totalDays: 22,
    dailyRate: 127.27,
    baseSalary: 2800,
    overtimeHours: 18,
    overtimeRate: 25,
    overtime: 450,
    bonus: 0,
    allowances: 150,
    taxDeduction: 150,
    insuranceDeduction: 80,
    otherDeductions: 50,
    deductions: 280,
    netPay: 2970,
    status: 'paid',
  },
  {
    id: 'EMP002',
    name: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    daysWorked: 21,
    totalDays: 22,
    dailyRate: 118.18,
    baseSalary: 2600,
    overtimeHours: 12.8,
    overtimeRate: 25,
    overtime: 320,
    bonus: 100,
    allowances: 100,
    taxDeduction: 140,
    insuranceDeduction: 80,
    otherDeductions: 40,
    deductions: 260,
    netPay: 2660,
    status: 'paid',
  },
  {
    id: 'EMP003',
    name: 'David Rodriguez',
    initials: 'DR',
    department: 'Patrol',
    daysWorked: 22,
    totalDays: 22,
    dailyRate: 145.45,
    baseSalary: 3200,
    overtimeHours: 23.2,
    overtimeRate: 25,
    overtime: 580,
    bonus: 200,
    allowances: 200,
    taxDeduction: 160,
    insuranceDeduction: 100,
    otherDeductions: 60,
    deductions: 320,
    netPay: 3460,
    status: 'pending',
  },
  {
    id: 'EMP004',
    name: 'Emily Johnson',
    initials: 'EJ',
    department: 'Administration',
    daysWorked: 20,
    totalDays: 22,
    dailyRate: 159.09,
    baseSalary: 3500,
    overtimeHours: 0,
    overtimeRate: 0,
    overtime: 0,
    bonus: 300,
    allowances: 200,
    taxDeduction: 175,
    insuranceDeduction: 100,
    otherDeductions: 75,
    deductions: 350,
    netPay: 3150,
    status: 'paid',
  },
  {
    id: 'EMP005',
    name: 'James Wilson',
    initials: 'JW',
    department: 'Field Security',
    daysWorked: 20,
    totalDays: 22,
    dailyRate: 109.09,
    baseSalary: 2400,
    overtimeHours: 15.2,
    overtimeRate: 25,
    overtime: 380,
    bonus: 50,
    allowances: 100,
    taxDeduction: 120,
    insuranceDeduction: 80,
    otherDeductions: 40,
    deductions: 240,
    netPay: 2540,
    status: 'paid',
  },
  {
    id: 'EMP006',
    name: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    daysWorked: 20,
    totalDays: 22,
    dailyRate: 100,
    baseSalary: 2200,
    overtimeHours: 0,
    overtimeRate: 0,
    overtime: 0,
    bonus: 0,
    allowances: 80,
    taxDeduction: 110,
    insuranceDeduction: 80,
    otherDeductions: 30,
    deductions: 220,
    netPay: 1980,
    status: 'pending',
  },
]
