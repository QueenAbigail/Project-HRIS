'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, Printer } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface PayslipEmployee {
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
  status: string
}

interface PayslipDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: PayslipEmployee | null
  period: string
  siteName?: string
}

interface LineItem {
  label: string
  amount: number
}

const FALLBACK_LOGO = '/logo/company-logo.webp'

const fetchBranding = async (url: string): Promise<{ logoUrl: string | null }> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to load branding')
  return response.json()
}

const COMPANY_NAME = 'PT. ProMaxima Rajawali'
const COMPANY_ADDRESS = 'Jl. Niaga No. 24 Nanggewer Cibinong Bogor Jawa Barat'
const SIGNING_CITY = 'Bogor'

// Payslip page size: A5 portrait. Text stays legible when the PDF is fit to a phone screen.
const PAGE_WIDTH_MM = 148
const PAGE_MIN_HEIGHT_MM = 210
const PX_PER_MM = 96 / 25.4
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * PX_PER_MM

// Ctrl+P on the page prints only the payslip, at its natural A5 portrait size.
const portraitPrintStyle = `
  @page {
    size: ${PAGE_WIDTH_MM}mm ${PAGE_MIN_HEIGHT_MM}mm;
    margin: 0;
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body * {
      visibility: hidden;
    }
    #payslip-print-zone, #payslip-print-zone * {
      visibility: visible;
    }
    #payslip-preview-scale {
      zoom: 1 !important;
    }
    #payslip-print-zone {
      position: fixed;
      top: 0;
      left: 0;
      margin: 0 !important;
    }
    button[aria-label="Close"] {
      display: none !important;
    }
  }
`

const MODERN_COLOR = /lab\(|oklab\(|oklch\(|lch\(|color\(|color-mix\(/
const COLOR_PROPS = [
  'color',
  'backgroundColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'textDecorationColor',
] as const

// html2canvas cannot parse lab()/oklch() colors, which Tailwind v4 resolves to.
// Rewrite them as rgba() on the cloned DOM only, so the on-screen payslip is untouched.
function flattenModernColors(clonedDoc: Document, root: HTMLElement) {
  const view = clonedDoc.defaultView
  if (!view) return

  const canvas = clonedDoc.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  const toRgba = (value: string) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = value
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
  }

  const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  for (const node of nodes) {
    const computed = view.getComputedStyle(node)
    for (const prop of COLOR_PROPS) {
      const value = computed[prop]
      if (value && MODERN_COLOR.test(value)) node.style[prop] = toRgba(value)
    }
    if (MODERN_COLOR.test(computed.boxShadow)) node.style.boxShadow = 'none'
  }
}

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatDate(date: Date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}

// "March 2026" -> "01-03-2026 - 31-03-2026". Falls back to the raw label for any other format.
function formatPeriodRange(period: string) {
  const [monthName, year] = period.trim().split(/\s+/)
  const month = MONTHS[monthName?.toLowerCase() ?? '']
  const yearNumber = Number(year)
  if (month === undefined || !Number.isFinite(yearNumber)) return period
  return `${formatDate(new Date(yearNumber, month, 1))} - ${formatDate(new Date(yearNumber, month + 1, 0))}`
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="break-words text-[11px] font-semibold leading-tight text-slate-900">{value}</p>
    </div>
  )
}

function Amount({ value }: { value: number }) {
  return (
    <span
      className={`shrink-0 font-mono text-[10.5px] tabular-nums ${
        value === 0 ? 'text-slate-300' : 'font-semibold text-slate-900'
      }`}
    >
      {formatCurrency(value)}
    </span>
  )
}

function LineCell({ item, divider }: { item?: LineItem; divider?: boolean }) {
  return (
    <div
      className={`flex min-h-[6.2mm] items-center justify-between gap-2 border-b border-slate-100 py-[3px] ${
        divider ? 'border-l pl-3' : 'pr-3'
      }`}
    >
      {item && (
        <>
          <span className="text-[10.5px] text-slate-600">{item.label}</span>
          <Amount value={item.amount} />
        </>
      )}
    </div>
  )
}

export function PayslipDrawer({ open, onOpenChange, employee, period, siteName }: PayslipDrawerProps) {
  const [previewContainer, setPreviewContainer] = useState<HTMLDivElement | null>(null)
  const [previewZoom, setPreviewZoom] = useState(1)
  const { data: branding } = useSWR('/api/system-settings', fetchBranding)
  const logoSrc = branding?.logoUrl || FALLBACK_LOGO

  useEffect(() => {
    if (typeof (window as any).html2pdf === 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  // Shrink the preview (only the on-screen copy) to fit narrow screens.
  useEffect(() => {
    if (!previewContainer) return
    const update = () => {
      const available = previewContainer.clientWidth
      setPreviewZoom(available > 0 ? Math.min(1, available / PAGE_WIDTH_PX) : 1)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(previewContainer)
    return () => observer.disconnect()
  }, [previewContainer])

  if (!employee) return null

  // Only some of these exist in the payroll data yet; the rest print as Rp 0 until HR records them.
  const earnings: LineItem[] = [
    { label: 'Gaji Pokok', amount: employee.baseSalary },
    { label: 'Tunj. Kompetensi', amount: employee.allowances },
    { label: 'Kesehatan', amount: 0 },
    { label: 'Kehadiran', amount: 0 },
    { label: 'Lembur', amount: employee.overtime },
    { label: 'Lembur Ganti', amount: 0 },
    { label: 'Bonus', amount: employee.bonus },
    { label: 'Rapel', amount: 0 },
    { label: 'Tunj. PPh', amount: 0 },
    { label: 'Housing', amount: 0 },
    { label: 'Meal', amount: 0 },
    { label: 'Transport', amount: 0 },
    { label: 'Perdiem', amount: 0 },
  ]
  const deductions: LineItem[] = [
    { label: 'PPh 21', amount: employee.taxDeduction },
    { label: 'BPJS Kes & TK', amount: employee.insuranceDeduction },
    { label: 'Lainnya', amount: employee.otherDeductions },
    { label: 'Penalti', amount: 0 },
    { label: 'PKWT', amount: 0 },
  ]
  const rowCount = Math.max(earnings.length, deductions.length)
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0)
  const totalDeductions = employee.deductions
  const periodRange = formatPeriodRange(period)
  const issuedOn = formatDate(new Date())

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-print-zone')
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Slip Gaji - ${employee.name}</title>
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            @page {
              size: ${PAGE_WIDTH_MM}mm ${PAGE_MIN_HEIGHT_MM}mm;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: black;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()

    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 700)
  }

  const handleDownloadPDF = () => {
    try {
      const element = document.getElementById('payslip-print-zone')
      if (!element) {
        alert('Error: Could not find payslip element')
        return
      }

      if (typeof (window as any).html2pdf === 'undefined') {
        alert('PDF library is still loading. Please try again in a moment.')
        return
      }

      const html2pdf = (window as any).html2pdf

      // One portrait page that grows with the content, so nothing is cut off or pushed to a blank page 2.
      const contentHeightMm = Math.ceil(element.scrollHeight / PX_PER_MM) + 1
      const pageHeightMm = Math.max(PAGE_MIN_HEIGHT_MM, contentHeightMm)

      const opt = {
        margin: 0,
        filename: `payslip_${employee.id}_${period.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 3,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc: Document, clonedEl: HTMLElement) => flattenModernColors(clonedDoc, clonedEl),
        },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: [PAGE_WIDTH_MM, pageHeightMm] },
        pagebreak: { mode: 'avoid-all' },
      }

      const method = html2pdf.default ? html2pdf.default() : html2pdf()
      method.set(opt).from(element).save()
    } catch (error) {
      alert(`Failed to generate PDF: ${(error as Error).message}`)
    }
  }

  return (
    <>
      <style>{portraitPrintStyle}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[92vh] max-w-[95vw] flex-col gap-0 overflow-hidden border-none bg-white p-0 shadow-2xl sm:max-w-[640px] print:border-none print:shadow-none">
          <DialogHeader className="sr-only print:hidden">
            <DialogTitle>Slip Gaji Karyawan</DialogTitle>
            <DialogDescription>
              {period} • {employee.name}
            </DialogDescription>
          </DialogHeader>

          <div
            ref={setPreviewContainer}
            className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-5 print:bg-white print:p-0"
          >
            <div
              id="payslip-preview-scale"
              className="mx-auto"
              style={{ width: `${PAGE_WIDTH_MM}mm`, zoom: previewZoom }}
            >
              {/* A5 portrait payslip */}
              <div
                id="payslip-print-zone"
                className="flex flex-col bg-white text-slate-900 shadow-md print:shadow-none"
                style={{
                  width: `${PAGE_WIDTH_MM}mm`,
                  minHeight: `${PAGE_MIN_HEIGHT_MM}mm`,
                  padding: '10mm 9mm 9mm',
                }}
              >
                {/* Company */}
                <header className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoSrc}
                    alt=""
                    crossOrigin="anonymous"
                    className="h-10 w-10 shrink-0 object-contain"
                  />
                  <div className="min-w-0">
                    <h1 className="text-[13px] font-bold leading-tight text-slate-900">{COMPANY_NAME}</h1>
                    <p className="mt-0.5 text-[9px] leading-snug text-slate-500">{COMPANY_ADDRESS}</p>
                  </div>
                </header>

                <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-slate-900 pt-2.5">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900">
                    Slip Gaji Karyawan
                  </h2>
                  <p className="text-[9px] font-medium text-slate-500">{period}</p>
                </div>

                {/* Employee */}
                <section className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5">
                  <InfoRow label="Nama" value={employee.name} />
                  <InfoRow label="Jabatan" value={employee.department} />
                  <InfoRow label="NIK" value={employee.id} />
                  <InfoRow label="Hari Kerja" value={`${employee.daysWorked} / ${employee.totalDays}`} />
                  <InfoRow label="Lokasi" value={siteName ?? '-'} />
                  <InfoRow label="Periode Remunerasi" value={periodRange} />
                </section>

                {/* Penerimaan / Potongan */}
                <section className="mt-5">
                  <div className="grid grid-cols-2 border-b-2 border-green-700 pb-1.5">
                    <h3 className="pr-3 text-[9px] font-bold uppercase tracking-[0.2em] text-green-700">
                      Penerimaan
                    </h3>
                    <h3 className="border-l border-transparent pl-3 text-[9px] font-bold uppercase tracking-[0.2em] text-green-700">
                      Potongan
                    </h3>
                  </div>

                  {Array.from({ length: rowCount }, (_, index) => (
                    <div key={index} className="grid grid-cols-2">
                      <LineCell item={earnings[index]} />
                      <LineCell item={deductions[index]} divider />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 border-t border-slate-900">
                    <div className="flex items-center justify-between gap-2 py-2 pr-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-900">
                        Total Penerimaan
                      </span>
                      <span className="font-mono text-[10.5px] font-bold tabular-nums text-slate-900">
                        {formatCurrency(totalEarnings)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-l border-slate-100 py-2 pl-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-900">
                        Total Potongan
                      </span>
                      <span className="font-mono text-[10.5px] font-bold tabular-nums text-slate-900">
                        {formatCurrency(totalDeductions)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Take home pay */}
                <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-green-50 px-4 py-3">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-green-800">Gaji Bersih</p>
                    <p className="text-[9px] text-green-700">Penerimaan - Potongan</p>
                  </div>
                  <p className="font-mono text-[18px] font-bold leading-none tabular-nums text-green-800">
                    {formatCurrency(employee.netPay)}
                  </p>
                </div>

                {/* Sign-off, pinned toward the bottom of the page */}
                <footer className="mt-auto flex items-end justify-between gap-4 pt-8">
                  <p className="max-w-[55mm] text-[8px] leading-snug text-slate-400">
                    Dokumen ini dibuat otomatis. Hubungi HRD jika terdapat ketidaksesuaian.
                  </p>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600">
                      {SIGNING_CITY}, {issuedOn}
                    </p>
                    <p className="mt-10 text-[10px] font-bold text-slate-900">Bag. HRD</p>
                  </div>
                </footer>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t bg-white px-4 py-3 sm:px-6 print:hidden">
            <Button variant="outline" className="font-bold text-slate-700 hover:text-slate-900" onClick={handlePrint}>
              <Printer className="mr-2 size-4" />
              Print
            </Button>
            <Button className="bg-slate-900 font-bold text-white shadow-md hover:bg-slate-800" onClick={handleDownloadPDF}>
              <Download className="mr-2 size-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
