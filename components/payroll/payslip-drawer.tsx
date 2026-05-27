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

// CSS Print Super Aman
const landscapePrintStyle = `
  @page {
    /* Sengaja nggak pakai 'size: landscape' biar dropdown Layout di Chrome muncul */
    margin: 10mm; 
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* 1. Bikin semua elemen di layar jadi tembus pandang (hilang) */
    body * {
      visibility: hidden;
    }
    
    /* 2. Tampilkan HANYA area payslip dan isinya */
    #payslip-print-zone, #payslip-print-zone * {
      visibility: visible;
    }
    
    /* 3. Tarik area payslip ke pojok kiri atas kertas biar pas 1 halaman */
    #payslip-print-zone {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    /* 4. Sembunyikan tombol 'X' (Close) bawaan Shadcn */
    button[aria-label="Close"] {
      display: none !important;
    }
  }
`

export function PayslipDrawer({ open, onOpenChange, employee, period }: PayslipDrawerProps) {
  if (!employee) return null

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

      // Load html2pdf from CDN if not already loaded
      if (typeof (window as any).html2pdf === 'undefined') {
        console.error('[v0] html2pdf library not found')
        alert('PDF library is loading. Please try again in a moment.')
        return
      }

      const html2pdf = (window as any).html2pdf.jsPDF || (window as any).html2pdf

      const opt = {
        margin: 8,
        filename: `payslip_${employee.id}_${period.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }

      console.log('[v0] Generating PDF...')
      html2pdf.default ? html2pdf.default().set(opt).from(element).save() : html2pdf().set(opt).from(element).save()
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
        <DialogContent className="sm:max-w-5xl w-[95vw] bg-white p-0 border-none shadow-2xl overflow-hidden print:border-none print:shadow-none">
          <DialogHeader className="sr-only print:hidden">
            <DialogTitle>Pay Slip</DialogTitle>
            <DialogDescription>
              {period} • {employee.name}
            </DialogDescription>
          </DialogHeader>

          {/* ZONA CETAK - Hanya kotak ini yang akan masuk ke kertas */}
          <div
            id="payslip-print-zone"
            className="relative w-full bg-white text-slate-900 p-8 flex flex-col justify-between"
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
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900">PT Pro Maxima Rajawali</h1>
                    <div className="flex gap-6 mt-1 text-sm">
                      <span className="text-slate-500 font-bold tracking-widest uppercase">Pay Slip</span>
                      <span className="font-bold text-slate-900">{period}</span>
                    </div>
                  </div>
                  <Badge className={`${statusStyle.badge} text-sm py-1.5 px-4 h-fit flex-shrink-0 shadow-sm border-none`}>
                    {employee.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Info Karyawan */}
                <div className="flex items-center gap-8 py-2 mb-2">
                  <Avatar className="size-16 flex-shrink-0 border bg-white shadow-sm">
                    <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-lg font-bold">
                      {employee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-4 gap-8 text-sm flex-1">
                    <div>
                      <p className="text-slate-400 font-bold mb-1 text-xs tracking-wider">EMPLOYEE NAME</p>
                      <p className="font-bold text-slate-900 text-base">{employee.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold mb-1 text-xs tracking-wider">EMPLOYEE ID</p>
                      <p className="font-bold text-slate-900 text-base">{employee.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold mb-1 text-xs tracking-wider">DEPARTMENT</p>
                      <p className="font-bold text-slate-900 text-base">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold mb-1 text-xs tracking-wider">DAYS WORKED</p>
                      <p className="font-bold text-slate-900 text-base">{employee.daysWorked} / {employee.totalDays}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Gaji - 2 Kolom Kiri Kanan */}
              <div className="flex-1 flex gap-12 py-6 border-y border-gray-200 mt-4">
                {/* Kolom Pemasukan */}
                <div className="flex-1 border-r border-gray-100 pr-12">
                  <h3 className="font-bold text-slate-900 uppercase text-sm mb-5 tracking-widest">Earnings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Base Salary</span>
                      <span className="font-mono font-semibold text-slate-900">{formatCurrency(employee.baseSalary)}</span>
                    </div>
                    {employee.overtimeHours > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Overtime ({employee.overtimeHours}h)</span>
                        <span className="font-mono font-semibold text-green-600">+{formatCurrency(employee.overtime)}</span>
                      </div>
                    )}
                    {employee.bonus > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Bonus</span>
                        <span className="font-mono font-semibold text-green-600">+{formatCurrency(employee.bonus)}</span>
                      </div>
                    )}
                    {employee.allowances > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Allowances</span>
                        <span className="font-mono font-semibold text-green-600">+{formatCurrency(employee.allowances)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                      <span className="text-slate-900 font-bold text-sm tracking-wider">TOTAL GROSS</span>
                      <span className="font-mono text-lg font-bold text-green-700">{formatCurrency(totalGross)}</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Potongan */}
                <div className="flex-1 pl-4">
                  <h3 className="font-bold text-slate-900 uppercase text-sm mb-5 tracking-widest">Deductions</h3>
                  <div className="space-y-3 text-sm">
                    {employee.taxDeduction > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Income Tax</span>
                        <span className="font-mono font-semibold text-red-600">-{formatCurrency(employee.taxDeduction)}</span>
                      </div>
                    )}
                    {employee.insuranceDeduction > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Insurance</span>
                        <span className="font-mono font-semibold text-red-600">-{formatCurrency(employee.insuranceDeduction)}</span>
                      </div>
                    )}
                    {employee.otherDeductions > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Other Deductions</span>
                        <span className="font-mono font-semibold text-red-600">-{formatCurrency(employee.otherDeductions)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                      <span className="text-slate-900 font-bold text-sm tracking-wider">TOTAL DEDUCTIONS</span>
                      <span className="font-mono text-lg font-bold text-red-700">-{formatCurrency(employee.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Take Home Pay */}
              <div className="pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg px-8 py-5 flex items-center justify-between mb-2 shadow-sm">
                  <div>
                    <span className="text-lg font-bold text-slate-900 uppercase tracking-widest block">Take Home Pay</span>
                    <span className="text-xs text-green-700/80 font-bold mt-1 block">{takeHomePercentage}% of gross salary</span>
                  </div>
                  <span className="font-mono text-4xl font-black text-green-700">{formatCurrency(employee.netPay)}</span>
                </div>

                <div className="text-center py-2">
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
