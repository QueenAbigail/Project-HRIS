export interface WageRecord {
  id: string
  minimumWage: number
  effectiveDate: string
}

export interface SiteWage {
  siteId: string
  siteName: string
  siteCode: string
  current: WageRecord | null
  scheduled: WageRecord | null
  pendingEffectiveDate: string
}

export interface SalaryBaseResponse {
  today: string
  sites: SiteWage[]
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}
