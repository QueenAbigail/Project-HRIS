'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, Printer } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { useEffect, useState } from 'react'

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
}

// Payslip page size: A5 portrait. Text stays legible when the PDF is fit to a phone screen.
const PAGE_WIDTH_MM = 148
const PAGE_MIN_HEIGHT_MM = 210
const PX_PER_MM = 96 / 25.4
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * PX_PER_MM

const statusStyles: Record<string, { label: string; className: string }> = {
  sent: { label: 'SENT', className: 'bg-green-100 text-green-800' },
  'not-sent': { label: 'NOT SENT', className: 'bg-yellow-100 text-yellow-800' },
}

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

function Row({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'positive' | 'negative'
}) {
  const toneClass =
    tone === 'positive' ? 'text-green-700' : tone === 'negative' ? 'text-red-600' : 'text-slate-900'
  return (
    <div className="flex items-baseline justify-between gap-3 py-[5px]">
      <span className="text-[12px] text-slate-600">{label}</span>
      <span className={`font-mono text-[12px] font-semibold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1 border-b border-slate-300 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </h3>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="break-words text-[12px] font-semibold leading-tight text-slate-900">{value}</p>
    </div>
  )
}

export function PayslipDrawer({ open, onOpenChange, employee, period }: PayslipDrawerProps) {
  const [previewContainer, setPreviewContainer] = useState<HTMLDivElement | null>(null)
  const [previewZoom, setPreviewZoom] = useState(1)

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

  const statusStyle = statusStyles[employee.status] ?? {
    label: employee.status.toUpperCase(),
    className: 'bg-slate-100 text-slate-700',
  }
  const totalGross = employee.baseSalary + employee.overtime + employee.bonus + employee.allowances
  const takeHomePercentage = totalGross > 0 ? ((employee.netPay / totalGross) * 100).toFixed(1) : '0.0'

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-print-zone')
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${employee.name}</title>
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
            <DialogTitle>Pay Slip</DialogTitle>
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
                className="relative flex flex-col overflow-hidden bg-white text-slate-900 shadow-md print:shadow-none"
                style={{
                  width: `${PAGE_WIDTH_MM}mm`,
                  minHeight: `${PAGE_MIN_HEIGHT_MM}mm`,
                  padding: '9mm 9mm 8mm',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 z-0"
                  style={{
                    backgroundImage: 'url(/logo/company-logo.webp)',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '280px 280px',
                    opacity: 0.06,
                    filter: 'grayscale(100%)',
                  }}
                />

                <div className="relative z-10 flex flex-1 flex-col">
                  {/* Header */}
                  <header className="flex items-start justify-between gap-3 border-b-2 border-slate-900 pb-3">
                    <div className="min-w-0">
                      <h1 className="text-[15px] font-black leading-tight text-slate-900">
                        PT Pro Maxima Rajawali
                      </h1>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        Pay Slip
                      </p>
                      <p className="text-[12px] font-semibold text-slate-900">{period}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${statusStyle.className}`}
                    >
                      {statusStyle.label}
                    </span>
                  </header>

                  {/* Employee */}
                  <section className="mt-3 flex items-center gap-3 rounded-md bg-slate-50 p-3">
                    <Avatar className="size-12 shrink-0 border bg-white">
                      <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                      <AvatarFallback className="bg-slate-100 text-[12px] font-bold text-slate-700">
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-2">
                      <InfoCell label="Employee Name" value={employee.name} />
                      <InfoCell label="Employee ID" value={employee.id} />
                      <InfoCell label="Department" value={employee.department} />
                      <InfoCell label="Days Worked" value={`${employee.daysWorked} / ${employee.totalDays}`} />
                    </div>
                  </section>

                  {/* Earnings */}
                  <section className="mt-4">
                    <SectionTitle>Earnings</SectionTitle>
                    <Row label="Base Salary" value={formatCurrency(employee.baseSalary)} />
                    {employee.overtimeHours > 0 && (
                      <Row
                        label={`Overtime (${employee.overtimeHours}h)`}
                        value={`+${formatCurrency(employee.overtime)}`}
                        tone="positive"
                      />
                    )}
                    {employee.bonus > 0 && (
                      <Row label="Bonus" value={`+${formatCurrency(employee.bonus)}`} tone="positive" />
                    )}
                    {employee.allowances > 0 && (
                      <Row label="Allowances" value={`+${formatCurrency(employee.allowances)}`} tone="positive" />
                    )}
                    <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-slate-300 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                        Total Gross
                      </span>
                      <span className="font-mono text-[13px] font-bold tabular-nums text-green-700">
                        {formatCurrency(totalGross)}
                      </span>
                    </div>
                  </section>

                  {/* Deductions */}
                  <section className="mt-4">
                    <SectionTitle>Deductions</SectionTitle>
                    {employee.taxDeduction > 0 && (
                      <Row label="Income Tax" value={`-${formatCurrency(employee.taxDeduction)}`} tone="negative" />
                    )}
                    {employee.insuranceDeduction > 0 && (
                      <Row
                        label="Insurance"
                        value={`-${formatCurrency(employee.insuranceDeduction)}`}
                        tone="negative"
                      />
                    )}
                    {employee.otherDeductions > 0 && (
                      <Row
                        label="Other Deductions"
                        value={`-${formatCurrency(employee.otherDeductions)}`}
                        tone="negative"
                      />
                    )}
                    {employee.deductions === 0 && <Row label="No deductions" value={formatCurrency(0)} />}
                    <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-slate-300 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                        Total Deductions
                      </span>
                      <span className="font-mono text-[13px] font-bold tabular-nums text-red-700">
                        -{formatCurrency(employee.deductions)}
                      </span>
                    </div>
                  </section>

                  {/* Take home pay, pinned toward the bottom of the page */}
                  <div className="mt-auto pt-5">
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        Take Home Pay
                      </p>
                      <p className="mt-1 font-mono text-[24px] font-black leading-none tabular-nums text-green-700">
                        {formatCurrency(employee.netPay)}
                      </p>
                      <p className="mt-1.5 text-[10px] font-semibold text-green-700">
                        {takeHomePercentage}% of gross salary
                      </p>
                    </div>
                    <p className="mt-4 text-center text-[9px] leading-snug text-slate-400">
                      This is an automated pay slip. Please contact HR for discrepancies.
                    </p>
                  </div>
                </div>
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
