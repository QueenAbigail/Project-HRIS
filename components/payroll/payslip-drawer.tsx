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

// Trik Nuklir CSS: Paksa A4 Landscape murni, sembunyiin semua kecuali zona print
const landscapePrintStyle = `
  @page {
    size: A4 landscape;
    margin: 0; 
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background-color: white !important;
    }
    /* Sembunyikan SEMUA elemen di layar */
    body * {
      visibility: hidden;
    }
    /* Munculkan HANYA kotak payslip dan isinya */
    #payslip-print-zone, #payslip-print-zone * {
      visibility: visible;
    }
    /* Kunci posisi payslip persis di ukuran kertas A4 */
    #payslip-print-zone {
      position: fixed;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 15mm 20mm; /* Margin dalam kertas biar aman dari border */
      box-sizing: border-box;
      background-color: white;
      z-index: 9999;
    }
    /* Sembunyikan tombol action saat print */
    .hide-on-print {
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
        {/* Paksa web view melar jadi 1100px. [&>button]:hidden buat nyembunyiin 'X' close button Shadcn saat nge-print */}
        <DialogContent className="!max-w-[1100px] !w-[95vw] bg-white !p-0 overflow-hidden rounded-xl shadow-2xl [&>button]:print:hidden border-none">
          <DialogHeader className="sr-only hide-on-print">
            <DialogTitle>Pay Slip</DialogTitle>
            <DialogDescription>
              {period} • {employee.name}
            </DialogDescription>
          </DialogHeader>

          {/* Zona yang bakal di-print. Dikasih min-h-[600px] biar di web bentuknya proporsional kayak kertas */}
          <div
            id="payslip-print-zone"
            className="relative w-full bg-white text-slate-900 p-10 flex flex-col justify-between min-h-[600px]"
          >
            {/* Watermark Overlay - Grayscale & Ultra Faint */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: `url(/logo/company-logo.webp)`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '500px 500px',
                opacity: 0.10,
                filter: 'grayscale(100%)',
              }}
            />

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header Section */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">PT Pro Maxima Rajawali</h1>
                    <div className="flex gap-6 mt-1 text-sm">
                      <span className="text-slate-500 font-semibold tracking-widest">PAY SLIP</span>
                      <span className="font-bold text-slate-900">{period}</span>
                    </div>
                  </div>
                  <Badge className={`${statusStyle.badge} text-sm py-1 px-4 h-fit flex-shrink-0 shadow-sm border-none`}>
                    {employee.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Employee Info */}
                <div className="flex items-center gap-8 py-2 mb-2">
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

              {/* Main Content - Earnings and Deductions */}
              <div className="flex-1 flex gap-12 py-6 border-y-2 border-gray-200 mt-4">
                {/* Earnings */}
                <div className="flex-1 border-r-2 border-gray-100 pr-12">
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

                {/* Deductions */}
                <div className="flex-1 pl-12">
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

              {/* Bottom Section */}
              <div className="pt-6 mt-auto">
                {/* Net Pay */}
                <div className="bg-green-50 border border-green-200 rounded-lg px-8 py-5 flex items-center justify-between mb-4 shadow-sm">
                  <div>
                    <span className="text-lg font-bold text-slate-900 uppercase tracking-widest block">TAKE HOME PAY</span>
                    <span className="text-xs text-green-700/70 font-semibold mt-1 block">{takeHomePercentage}% of gross salary</span>
                  </div>
                  <span className="font-mono text-4xl font-black text-green-700">{formatCurrency(employee.netPay)}</span>
                </div>

                {/* Footer */}
                <div className="text-center py-2">
                  <p className="text-xs text-slate-400 font-medium">This is an automated pay slip. Please contact HR for discrepancies.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hide-on-print flex gap-3 justify-end px-10 pb-8 bg-white rounded-b-xl">
            <Button 
              variant="outline" 
              className="text-slate-700 hover:text-slate-900 font-semibold"
              onClick={handlePrint}
            >
              <Printer className="mr-2 size-4" />
              Print
            </Button>
            <Button 
              className="bg-slate-900 text-white hover:bg-slate-800 font-semibold"
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