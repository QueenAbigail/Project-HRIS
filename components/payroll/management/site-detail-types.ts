export type CutoffOption = '15' | '20' | '25' | 'eom'

export type DataSourceType = 'auto' | 'edited' | 'excel'

export interface SiteConfigDetail {
  siteId: string
  siteName: string
  location: string
  cutoffDay: CutoffOption
  defaultEffectiveDays: number
}

export interface SiteEmployeePayroll {
  employeeId: string
  name: string
  position: string
  source: DataSourceType
  hasSchedule: boolean
  isNewHire: boolean
  joinDate?: string
  effectiveDays: number
  presentDays: number
  alphaDays: number
  // Overtime hours breakdown
  fixedOtHours: number
  holidayOtHours: number
  bkoOtHours: number
  // Money rules (from Manage Salary / Overtime / Deduction)
  fullBaseSalary: number
  hourlyRate: number
  monthlyAllowance: number
  dailyAllowanceRate: number
  fixedDeductionAmount: number
  // Flags & notes for transparency
  notes?: string
  cappedClockNote?: string
  swapHolidayNote?: string
}

export interface CalculatedEmployeePayroll extends SiteEmployeePayroll {
  baseSalary: number
  fixedOtAmount: number
  holidayOtAmount: number
  bkoOtAmount: number
  overtime: number
  totalOtHours: number
  allowance: number
  alphaPenalty: number
  deductions: number
  netPay: number
}

export interface SitePayrollAdjustment {
  id: string
  employee: string
  type: 'overtime' | 'bonus' | 'deduction'
  amount: number
  reason: string
  date: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actor: string
  action: 'EDIT_EMPLOYEE' | 'EXCEL_IMPORT' | 'SET_CUTOFF' | 'ADD_ADJUSTMENT' | 'DELETE_ADJUSTMENT' | 'SYNC_AUTO' | 'FINALIZE_LOCK'
  target: string
  detail: string
}

export const cutoffChoices: { value: CutoffOption; label: string }[] = [
  { value: '15', label: 'Tanggal 15 (16 bulan lalu - 15 bulan ini)' },
  { value: '20', label: 'Tanggal 20 (21 bulan lalu - 20 bulan ini)' },
  { value: '25', label: 'Tanggal 25 (26 bulan lalu - 25 bulan ini)' },
  { value: 'eom', label: 'Akhir Bulan (1 - akhir bulan)' },
]

export function computeCutoffSummary(cutoffDay: CutoffOption) {
  const refYear = 2026
  const refMonth = 2 // March 2026 mockup reference
  const refDay = 27

  let targetYear = refYear
  let targetMonth = refMonth

  if (cutoffDay !== 'eom' && refDay > Number(cutoffDay)) {
    targetMonth += 1
  }

  let startDate: Date
  let endDate: Date
  if (cutoffDay === 'eom') {
    startDate = new Date(targetYear, targetMonth, 1)
    endDate = new Date(targetYear, targetMonth + 1, 0)
  } else {
    const cutoffNumber = Number(cutoffDay)
    const daysInTarget = new Date(targetYear, targetMonth + 1, 0).getDate()
    endDate = new Date(targetYear, targetMonth, Math.min(cutoffNumber, daysInTarget))
    startDate = new Date(targetYear, targetMonth - 1, cutoffNumber + 1)
  }

  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  const periodLabel = new Date(targetYear, targetMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return {
    periodLabel,
    cutoffRange: `${fmt(startDate)} - ${fmt(endDate)}`,
    cutoffLabel: cutoffDay === 'eom' ? 'Akhir Bulan' : `Tanggal ${cutoffDay}`,
  }
}

export function calculateEmployeePayroll(emp: SiteEmployeePayroll): CalculatedEmployeePayroll {
  const divisor = Math.max(1, emp.effectiveDays)
  // Base salary: prorated ONLY for new hires; otherwise stays full (Alpha goes to Deductions)
  const baseSalary = emp.isNewHire
    ? Math.round((emp.fullBaseSalary * Math.min(emp.presentDays, divisor)) / divisor)
    : emp.fullBaseSalary

  // Overtime multipliers (mockup aligned with PP 35/2021 & Manage Overtime rules)
  const fixedOtAmount = Math.round(emp.fixedOtHours * emp.hourlyRate * 1.5)
  const holidayOtAmount = Math.round(emp.holidayOtHours * emp.hourlyRate * 2.0)
  const bkoOtAmount = Math.round(emp.bkoOtHours * emp.hourlyRate * 1.5)
  const overtime = fixedOtAmount + holidayOtAmount + bkoOtAmount
  const totalOtHours = emp.fixedOtHours + emp.holidayOtHours + emp.bkoOtHours

  // Allowance: monthly fixed + daily rate * actual present days
  const allowance = emp.monthlyAllowance + emp.dailyAllowanceRate * emp.presentDays

  // Alpha penalty: calculated as (alphaDays / effectiveDays) * fullBaseSalary
  const alphaPenalty = emp.alphaDays > 0
    ? Math.round((emp.fullBaseSalary * emp.alphaDays) / divisor)
    : 0

  const deductions = emp.fixedDeductionAmount + alphaPenalty
  const netPay = baseSalary + overtime + allowance - deductions

  return {
    ...emp,
    baseSalary,
    fixedOtAmount,
    holidayOtAmount,
    bkoOtAmount,
    overtime,
    totalOtHours,
    allowance,
    alphaPenalty,
    deductions,
    netPay,
  }
}

export const mockSiteConfigs: Record<string, SiteConfigDetail> = {
  S1: {
    siteId: 'S1',
    siteName: 'PPLI - Nambo',
    location: 'Bogor',
    cutoffDay: '20',
    defaultEffectiveDays: 22,
  },
  S2: {
    siteId: 'S2',
    siteName: 'HM Sampoerna - Sukorejo',
    location: 'Pasuruan',
    cutoffDay: '25',
    defaultEffectiveDays: 22,
  },
  S3: {
    siteId: 'S3',
    siteName: 'Astra - Sunter',
    location: 'Jakarta',
    cutoffDay: 'eom',
    defaultEffectiveDays: 22,
  },
}

const baseMockEmployees: SiteEmployeePayroll[] = [
  {
    employeeId: 'E001',
    name: 'Budi Santoso',
    position: 'Danru Security',
    source: 'auto',
    hasSchedule: true,
    isNewHire: false,
    effectiveDays: 22,
    presentDays: 22,
    alphaDays: 0,
    fixedOtHours: 16,
    holidayOtHours: 0,
    bkoOtHours: 0,
    fullBaseSalary: 6200000,
    hourlyRate: 35000,
    monthlyAllowance: 600000,
    dailyAllowanceRate: 25000,
    fixedDeductionAmount: 310000,
    notes: 'Schedule lengkap (shift 12 jam -> Fixed OT otomatis).',
  },
  {
    employeeId: 'E002',
    name: 'Agus Pratama',
    position: 'Anggota Security',
    source: 'auto',
    hasSchedule: true,
    isNewHire: false,
    effectiveDays: 22,
    presentDays: 21,
    alphaDays: 1,
    fixedOtHours: 12,
    holidayOtHours: 0,
    bkoOtHours: 0,
    fullBaseSalary: 5500000,
    hourlyRate: 31800,
    monthlyAllowance: 300000,
    dailyAllowanceRate: 25000,
    fixedDeductionAmount: 275000,
    notes: 'Terjadwal 22 hari, hadir 21 hari tanpa izin -> Alpha 1 hari masuk Deductions.',
  },
  {
    employeeId: 'E003',
    name: 'Dedi Kurniawan',
    position: 'Anggota Security',
    source: 'auto',
    hasSchedule: true,
    isNewHire: false,
    effectiveDays: 22,
    presentDays: 22,
    alphaDays: 0,
    fixedOtHours: 12,
    holidayOtHours: 12,
    bkoOtHours: 0,
    fullBaseSalary: 5500000,
    hourlyRate: 31800,
    monthlyAllowance: 300000,
    dailyAllowanceRate: 25000,
    fixedDeductionAmount: 275000,
    swapHolidayNote: 'Tukar shift Approved dengan E004 di tanggal merah -> Full 12j National Holiday OT (tanpa double Fixed OT).',
    cappedClockNote: 'Check-out tgl 18 tercatat 20 jam di mesin absen, otomatis dibatasi sesuai shift 12 jam.',
  },
  {
    employeeId: 'E004',
    name: 'Rizky Ramadhan',
    position: 'Anggota Security',
    source: 'auto',
    hasSchedule: true,
    isNewHire: true,
    joinDate: '2026-03-11',
    effectiveDays: 22,
    presentDays: 12,
    alphaDays: 0,
    fixedOtHours: 8,
    holidayOtHours: 0,
    bkoOtHours: 0,
    fullBaseSalary: 5500000,
    hourlyRate: 31800,
    monthlyAllowance: 0,
    dailyAllowanceRate: 25000,
    fixedDeductionAmount: 220000,
    notes: 'Karyawan baru masuk 11 Mar 2026 -> Gaji Pokok prorate 12/22.',
  },
  {
    employeeId: 'E005',
    name: 'Hendra Wijaya',
    position: 'Anggota Security',
    source: 'auto',
    hasSchedule: false,
    isNewHire: false,
    effectiveDays: 22,
    presentDays: 15,
    alphaDays: 0,
    fixedOtHours: 8,
    holidayOtHours: 0,
    bkoOtHours: 0,
    fullBaseSalary: 5500000,
    hourlyRate: 31800,
    monthlyAllowance: 300000,
    dailyAllowanceRate: 25000,
    fixedDeductionAmount: 275000,
    notes: 'Schedule belum diinput: hadir tercatat 15 hari, Alpha otomatis = 0 (Base Salary tetap utuh).',
  },
  {
    employeeId: 'E006',
    name: 'Siti Aminah',
    position: 'Admin Site',
    source: 'edited',
    hasSchedule: false,
    isNewHire: false,
    effectiveDays: 22,
    presentDays: 22,
    alphaDays: 0,
    fixedOtHours: 0,
    holidayOtHours: 0,
    bkoOtHours: 6,
    fullBaseSalary: 5800000,
    hourlyRate: 33500,
    monthlyAllowance: 500000,
    dailyAllowanceRate: 25000,
    fixedDeductionAmount: 290000,
    notes: 'Sudah dikoreksi manual oleh HR (ditambah BKO 6 jam).',
  },
]

export const mockSiteEmployeesMap: Record<string, SiteEmployeePayroll[]> = {
  S1: baseMockEmployees,
  S2: baseMockEmployees.slice(0, 5).map((e, i) => ({
    ...e,
    employeeId: `S2-E0${i + 1}`,
    fullBaseSalary: e.fullBaseSalary - 300000,
  })),
  S3: baseMockEmployees.map((e, i) => ({
    ...e,
    employeeId: `S3-E0${i + 1}`,
    fullBaseSalary: e.fullBaseSalary + 250000,
  })),
}

export const mockExcelPreviewRows: Record<
  string,
  { presentDays: number; alphaDays: number; fixedOtHours: number; holidayOtHours: number; bkoOtHours: number }
> = {
  E001: { presentDays: 22, alphaDays: 0, fixedOtHours: 20, holidayOtHours: 0, bkoOtHours: 0 },
  E005: { presentDays: 22, alphaDays: 0, fixedOtHours: 16, holidayOtHours: 0, bkoOtHours: 4 },
  E006: { presentDays: 21, alphaDays: 1, fixedOtHours: 0, holidayOtHours: 0, bkoOtHours: 0 },
}

export const mockInitialAdjustments: Record<string, SitePayrollAdjustment[]> = {
  S1: [
    { id: 'adj1', employee: 'Budi Santoso', type: 'bonus', amount: 500000, reason: 'Insentif Danru Terbaik', date: '2026-03-19' },
  ],
  S2: [
    { id: 'adj2', employee: 'Agus Pratama', type: 'overtime', amount: 350000, reason: 'Backup Pos Tambahan', date: '2026-03-24' },
  ],
  S3: [
    { id: 'adj3', employee: 'Dedi Kurniawan', type: 'bonus', amount: 400000, reason: 'Apresiasi Kepatuhan Patroli', date: '2026-03-27' },
  ],
}

export const mockInitialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '27 Mar 2026, 09:15',
    actor: 'System Auto-Sync',
    action: 'SYNC_AUTO',
    target: 'All Site Employees',
    detail: 'Tarik absensi & jadwal cut-off otomatis. Dedi Kurniawan terdeteksi swap tgl merah (12j Holiday OT) & cap 20j -> 12j.',
  },
  {
    id: 'log-2',
    timestamp: '27 Mar 2026, 10:02',
    actor: 'Adi Candra (HR)',
    action: 'EDIT_EMPLOYEE',
    target: 'Siti Aminah',
    detail: 'Source: Auto App -> Edited. Ubah Hari Hadir 18 -> 22, BKO OT 0j -> 6j.',
  },
  {
    id: 'log-3',
    timestamp: '27 Mar 2026, 10:18',
    actor: 'Adi Candra (HR)',
    action: 'ADD_ADJUSTMENT',
    target: 'Budi Santoso',
    detail: 'Tambah Bonus Rp 500.000 (Insentif Danru Terbaik).',
  },
]
