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

// Landscape print CSS - Pakai margin 0 biar ga tabrakan sama padding Tailwind
const landscapePrintStyle = `
  @page {
    size: A4 landscape;
    margin: 0mm; 
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background-color: white !important;
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
      const element = document.getElementById('payslip-content')
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
        {/* Hapus 1400px! Ganti max-w-5xl. Reset semua posisi fixed & transform bawaan Shadcn saat print */}
        <DialogContent className="max-w-5xl w-[95vw] bg-white !p-0 overflow-hidden rounded-xl shadow-2xl print:!fixed print:!inset-0 print:!w-[297mm] print:!h-[210mm] print:!max-w-none print:!m-0 print:!p-0 print:!border-none print:!shadow-none print:!transform-none print:!translate-x-0 print:!translate-y-0 print:!top-0 print:!left-0 print:!rounded-none">
          <DialogHeader className="sr-only print:hidden">
            <DialogTitle>Pay Slip</DialogTitle>
            <DialogDescription>
              {period} • {employee.name}
            </DialogDescription>
          </DialogHeader>

          {/* White Paper Container */}
          <div
            id="payslip-content"
            className="relative w-full h-full bg-white text-slate-900 p-8 flex flex-col print:w-full print:h-full print:p-12 print:box-border"
          >
            {/* Watermark Overlay - Grayscale & Ultra Faint */}
            <div
              className="absolute inset-0 pointer-events-none z-0 print:absolute"
              style={{
                backgroundImage: `url(/logo/company-logo.webp)`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '500px 500px',
                opacity: 0.15,
                filter: 'grayscale(100%)',
              }}
            />

            {/* Content - Landscape Layout */}
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* Header Section */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900">PT Pro Maxima Rajawali</h1>
                    <div className="flex gap-6 mt-1 text-sm">
                      <span className="text-slate-600">PAY SLIP</span>
                      <span className="font-semibold text-slate-900">{period}</span>
                    </div>
                  </div>
                  <Badge className={`${statusStyle.badge} text-sm py-1 px-3 h-fit flex-shrink-0`}>
                    {employee.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Employee Info */}
                <div className="flex items-center gap-6 py-3 border-b border-gray-300">
                  <Avatar className="size-14 flex-shrink-0">
                    <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-900 text-base font-bold">
                      {employee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-4 gap-8 text-sm flex-1">
                    <div>
                      <p className="text-slate-500 font-semibold mb-1">NAME</p>
                      <p className="font-semibold text-slate-900">{employee.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-1">ID</p>
                      <p className="font-semibold text-slate-900">{employee.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-1">DEPARTMENT</p>
                      <p className="font-semibold text-slate-900">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-1">DAYS WORKED</p>
                      <p className="font-semibold text-slate-900">{employee.daysWorked}/{employee.totalDays}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Earnings and Deductions */}
              <div className="flex-1 flex gap-10 py-6 border-b border-gray-300">
                {/* Earnings */}
                <div className="flex-1 border-r border-gray-300 pr-10">
                  <h3 className="font-bold text-slate-900 uppercase text-sm mb-4">Earnings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Base Salary</span>
                      <span className="font-mono font-semibold text-slate-900">{formatCurrency(employee.baseSalary)}</span>
                    </div>
                    {employee.overtimeHours > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Overtime ({employee.overtimeHours}h)</span>
                        <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.overtime)}</span>
                      </div>
                    )}
                    {employee.bonus > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Bonus</span>
                        <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.bonus)}</span>
                      </div>
                    )}
                    {employee.allowances > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Allowances</span>
                        <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.allowances)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300 font-bold">
                      <span className="text-slate-900 text-sm">TOTAL GROSS</span>
                      <span className="font-mono text-base text-green-700">{formatCurrency(totalGross)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="flex-1 pl-10">
                  <h3 className="font-bold text-slate-900 uppercase text-sm mb-4">Deductions</h3>
                  <div className="space-y-3 text-sm">
                    {employee.taxDeduction > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Income Tax</span>
                        <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.taxDeduction)}</span>
                      </div>
                    )}
                    {employee.insuranceDeduction > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Insurance</span>
                        <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.insuranceDeduction)}</span>
                      </div>
                    )}
                    {employee.otherDeductions > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Other Deductions</span>
                        <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.otherDeductions)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300 font-bold">
                      <span className="text-slate-900 text-sm">TOTAL DEDUCTIONS</span>
                      <span className="font-mono text-base text-red-700">-{formatCurrency(employee.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="pt-4">
                {/* Net Pay */}
                <div className="bg-green-50/40 border-2 border-green-300 rounded-md px-8 py-4 flex items-center justify-between mb-4">
                  <span className="text-base font-bold text-slate-900 uppercase">TAKE HOME PAY</span>
                  <span className="font-mono text-3xl font-bold text-green-700">{formatCurrency(employee.netPay)}</span>
                </div>

                {/* Footer */}
                <div className="text-center py-2 border-t border-gray-200">
                  <p className="text-xs text-slate-600">This is an automated pay slip. Please contact HR for discrepancies.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="print:hidden flex gap-3 justify-end mt-4 px-8 pb-8">
            <Button 
              variant="outline" 
              className="text-slate-900"
              onClick={handlePrint}
            >
              <Printer className="mr-2 size-4" />
              Print
            </Button>
            <Button 
              variant="default" 
              className="bg-slate-900 text-white hover:bg-slate-800"
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