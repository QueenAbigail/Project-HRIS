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

// THE MAGIC CSS: Jinakin Shadcn Radix Portal
const landscapePrintStyle = `
  @page {
    size: A4 landscape;
    margin: 5mm; 
  }
  @media print {
    /* 1. Sembunyikan SEMUA elemen background (Dashboard dll) KECUALI modal Shadcn */
    body > *:not([data-radix-portal]) {
      display: none !important;
    }
    
    /* 2. Sembunyikan background hitam (overlay) dari Shadcn */
    [data-radix-portal] > div:first-of-type {
      display: none !important;
    }

    /* 3. Pastikan modal tidak ngambang, nempel pas di kertas */
    [data-radix-portal] {
      position: static !important;
    }

    /* 4. Tembak warna biar hijau Take Home Pay ga ilang */
    body {
      background-color: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = await import('html2pdf.js')
      const element = document.getElementById('payslip-print-zone')
      if (!element) return

      const opt = {
        margin: 10,
        filename: `payslip_${employee.id}_${period.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }

      html2pdf.default().set(opt).from(element).save()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  return (
    <>
      <style>{landscapePrintStyle}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* KUNCI LEBAR WEB: !max-w-[1100px] biar melar landscape. KUNCI PRINT: Hilangkan transform & fixed */}
        <DialogContent className="!max-w-[1100px] !w-[95vw] bg-white !p-0 overflow-hidden rounded-xl shadow-2xl border-none [&>button]:print:hidden print:!static print:!transform-none print:!w-full print:!max-w-none print:!m-0 print:!p-0 print:!shadow-none print:!rounded-none print:!h-auto print:!min-h-screen">
          <DialogHeader className="sr-only print:hidden">
            <DialogTitle>Pay Slip</DialogTitle>
            <DialogDescription>
              {period} • {employee.name}
            </DialogDescription>
          </DialogHeader>

          {/* Area Kertas - Lebar lega buat web & pas buat print */}
          <div
            id="payslip-print-zone"
            className="relative w-full bg-white text-slate-900 p-10 flex flex-col justify-between print:p-8"
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

            <div className="relative z-10 flex flex-col h-full print:break-inside-avoid">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
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
                <div className="flex items-center gap-8 py-3 mb-2">
                  <Avatar className="size-16 flex-shrink-0 border bg-white shadow-sm">
                    <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-lg font-bold">
                      {employee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-4 gap-12 text-sm flex-1">
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

              {/* Rincian Gaji - Format 2 Kolom Lebar */}
              <div className="flex-1 flex gap-16 py-6 border-y-2 border-gray-200 mt-4">
                {/* Kolom Pemasukan */}
                <div className="flex-1 border-r-2 border-gray-100 pr-16">
                  <h3 className="font-bold text-slate-900 uppercase text-sm mb-5 tracking-widest">Earnings</h3>
                  <div className="space-y-4 text-sm">
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
                  <div className="space-y-4 text-sm">
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
              <div className="pt-8">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg px-8 py-6 flex items-center justify-between mb-4 shadow-sm">
                  <div>
                    <span className="text-xl font-black text-slate-900 uppercase tracking-widest block">Take Home Pay</span>
                    <span className="text-sm text-green-700/80 font-bold mt-1 block">{takeHomePercentage}% of gross salary</span>
                  </div>
                  <span className="font-mono text-5xl font-black text-green-700">{formatCurrency(employee.netPay)}</span>
                </div>

                <div className="text-center py-2">
                  <p className="text-xs text-slate-400 font-medium">This is an automated pay slip. Please contact HR for discrepancies.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Print & Download (Otomatis hilang pas ngeprint) */}
          <div className="print:hidden flex gap-3 justify-end px-10 pb-8 bg-white rounded-b-xl border-t border-gray-100 pt-4">
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