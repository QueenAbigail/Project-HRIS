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
import { Badge } from '@/components/ui/badge'
import { Download, Printer } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { useEffect } from 'react'

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
  status: 'paid' | 'pending' | 'failed'
}

interface PayslipDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: PayslipEmployee | null
  period: string
}

const statusColors: Record<string, { badge: string }> = {
  paid: { badge: 'bg-green-100 text-green-800' },
  pending: { badge: 'bg-yellow-100 text-yellow-800' },
  failed: { badge: 'bg-red-100 text-red-800' },
}

// CSS Print Super Aman - A4 Landscape Half Size Centered
const landscapePrintStyle = `
  @page {
    size: 297mm 210mm;
    margin: 10mm;
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      width: 297mm;
      height: 210mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* 1. Bikin semua elemen di layar jadi tembus pandang (hilang) */
    body * {
      visibility: hidden;
    }
    
    /* 2. Tampilkan HANYA area payslip dan isinya */
    #payslip-print-zone, #payslip-print-zone * {
      visibility: visible;
    }
    
    /* 3. Tampilkan payslip di tengah dengan ukuran 50% */
    #payslip-print-zone {
      position: relative;
      width: 148.5mm;
      height: 105mm;
      margin: auto;
      padding: 5mm;
      box-sizing: border-box;
    }

    /* 4. Sembunyikan tombol 'X' (Close) bawaan Shadcn */
    button[aria-label="Close"] {
      display: none !important;
    }
  }
`

export function PayslipDrawer({ open, onOpenChange, employee, period }: PayslipDrawerProps) {
  if (!employee) return null

  useEffect(() => {
    // Load html2pdf library from CDN when component mounts
    if (typeof (window as any).html2pdf === 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.async = true
      script.onload = () => {
        console.log('[v0] html2pdf library loaded successfully')
      }
      script.onerror = () => {
        console.error('[v0] Failed to load html2pdf library')
      }
      document.head.appendChild(script)
    }
  }, [])

  const statusStyle = statusColors[employee.status]
  const totalGross = employee.baseSalary + employee.overtime + employee.bonus + employee.allowances
  const takeHomePercentage = ((employee.netPay / totalGross) * 100).toFixed(1)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    try {
      const element = document.getElementById('payslip-print-zone')
      if (!element) {
        console.error('[v0] Element not found')
        alert('Error: Could not find payslip element')
        return
      }

      // Check if html2pdf is loaded
      if (typeof (window as any).html2pdf === 'undefined') {
        console.error('[v0] html2pdf library not loaded yet')
        alert('PDF library is still loading. Please try again in a moment.')
        return
      }

      const html2pdf = (window as any).html2pdf

      const opt = {
        margin: 8,
        filename: `payslip_${employee.id}_${period.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }

      console.log('[v0] Generating PDF...')
      const method = html2pdf.default ? html2pdf.default() : html2pdf()
      method.set(opt).from(element).save()
      console.log('[v0] PDF generation initiated')
    } catch (error) {
      console.error('[v0] Error generating PDF:', error)
      alert(`Failed to generate PDF: ${(error as Error).message}`)
    }
  }

  return (
    <>
      <style>{landscapePrintStyle}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* max-w-5xl akan memaksa modal lebar di layar web */}
        <DialogContent className="sm:max-w-4xl max-w-[95vw] max-h-[90vh] bg-white p-0 border-none shadow-2xl overflow-hidden print:border-none print:shadow-none flex flex-col items-center justify-center">
          <DialogHeader className="sr-only print:hidden">
            <DialogTitle>Pay Slip</DialogTitle>
            <DialogDescription>
              {period} • {employee.name}
            </DialogDescription>
          </DialogHeader>

          {/* ZONA CETAK - A4 Landscape Half Size (148.5mm x 105mm) Centered */}
          <div
            id="payslip-print-zone"
            className="relative bg-white text-slate-900 flex flex-col justify-between overflow-hidden w-full"
            style={{ 
              aspectRatio: '297/210',
              padding: '8px',
              fontSize: '10px'
            }}
          >
            {/* Watermark Logo */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: `url(/logo/company-logo.webp)`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '400px 400px',
                opacity: 0.08,
                filter: 'grayscale(100%)',
              }}
            />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                  <div className="flex-1">
                    <h1 className="text-sm font-black text-slate-900 leading-tight">PT Pro Maxima Rajawali</h1>
                    <div className="flex gap-3 mt-0.5 text-xs">
                      <span className="text-slate-500 font-bold tracking-widest uppercase">Pay Slip</span>
                      <span className="font-bold text-slate-900">{period}</span>
                    </div>
                  </div>
                  <Badge className={`${statusStyle.badge} text-xs py-0.5 px-2 h-fit flex-shrink-0 shadow-sm border-none`}>
                    {employee.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Info Karyawan */}
                <div className="flex items-center gap-2 py-1 mb-1">
                  <Avatar className="size-12 flex-shrink-0 border bg-white shadow-sm">
                    <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold">
                      {employee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-4 gap-2 text-xs flex-1">
                    <div>
                      <p className="text-slate-400 font-bold mb-0.5 text-[9px] tracking-wider">EMPLOYEE NAME</p>
                      <p className="font-bold text-slate-900 text-xs leading-tight">{employee.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold mb-0.5 text-[9px] tracking-wider">EMPLOYEE ID</p>
                      <p className="font-bold text-slate-900 text-xs leading-tight">{employee.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold mb-0.5 text-[9px] tracking-wider">DEPARTMENT</p>
                      <p className="font-bold text-slate-900 text-xs leading-tight">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold mb-0.5 text-[9px] tracking-wider">DAYS WORKED</p>
                      <p className="font-bold text-slate-900 text-xs leading-tight">{employee.daysWorked} / {employee.totalDays}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Gaji - 2 Kolom Kiri Kanan */}
              <div className="flex-1 flex gap-4 py-2 border-y border-gray-200 mt-1">
                {/* Kolom Pemasukan */}
                <div className="flex-1 border-r border-gray-100 pr-4">
                  <h3 className="font-bold text-slate-900 uppercase text-xs mb-2 tracking-widest leading-tight">Earnings</h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium text-xs">Base Salary</span>
                      <span className="font-mono font-semibold text-slate-900 text-xs">{formatCurrency(employee.baseSalary)}</span>
                    </div>
                    {employee.overtimeHours > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-xs">Overtime ({employee.overtimeHours}h)</span>
                        <span className="font-mono font-semibold text-green-600 text-xs">+{formatCurrency(employee.overtime)}</span>
                      </div>
                    )}
                    {employee.bonus > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-xs">Bonus</span>
                        <span className="font-mono font-semibold text-green-600 text-xs">+{formatCurrency(employee.bonus)}</span>
                      </div>
                    )}
                    {employee.allowances > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-xs">Allowances</span>
                        <span className="font-mono font-semibold text-green-600 text-xs">+{formatCurrency(employee.allowances)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-200">
                      <span className="text-slate-900 font-bold text-xs tracking-wider">TOTAL GROSS</span>
                      <span className="font-mono text-xs font-bold text-green-700">{formatCurrency(totalGross)}</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Potongan */}
                <div className="flex-1 pl-4">
                  <h3 className="font-bold text-slate-900 uppercase text-xs mb-2 tracking-widest leading-tight">Deductions</h3>
                  <div className="space-y-1 text-xs">
                    {employee.taxDeduction > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-xs">Income Tax</span>
                        <span className="font-mono font-semibold text-red-600 text-xs">-{formatCurrency(employee.taxDeduction)}</span>
                      </div>
                    )}
                    {employee.insuranceDeduction > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-xs">Insurance</span>
                        <span className="font-mono font-semibold text-red-600 text-xs">-{formatCurrency(employee.insuranceDeduction)}</span>
                      </div>
                    )}
                    {employee.otherDeductions > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-xs">Other Deductions</span>
                        <span className="font-mono font-semibold text-red-600 text-xs">-{formatCurrency(employee.otherDeductions)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-200">
                      <span className="text-slate-900 font-bold text-xs tracking-wider">TOTAL DEDUCTIONS</span>
                      <span className="font-mono text-xs font-bold text-red-700">-{formatCurrency(employee.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Take Home Pay */}
              <div className="pt-2">
                <div className="bg-green-50 border border-green-200 rounded px-4 py-2 flex items-center justify-between mb-1 shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest block leading-tight">Take Home Pay</span>
                    <span className="text-xs text-green-700/80 font-bold mt-0.5 block">{takeHomePercentage}% of gross salary</span>
                  </div>
                  <span className="font-mono text-lg font-black text-green-700">{formatCurrency(employee.netPay)}</span>
                </div>

                <div className="text-center py-0.5">
                  <p className="text-xs text-slate-400 font-medium">This is an automated pay slip. Please contact HR for discrepancies.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Print & Download (Sembunyi otomatis saat print via Tailwind print:hidden) */}
          <div className="print:hidden flex gap-3 justify-end px-8 pb-6 bg-white rounded-b-xl">
            <Button 
              variant="outline" 
              className="text-slate-700 hover:text-slate-900 font-bold"
              onClick={handlePrint}
            >
              <Printer className="mr-2 size-4" />
              Print
            </Button>
            <Button 
              className="bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-md"
              onClick={handleDownloadPDF}
            >
              <Download className="mr-2 size-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
