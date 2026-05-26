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

// Landscape print CSS
const landscapePrintStyle = `
  @page {
    size: landscape;
    margin: 10mm;
  }
  @media print {
    body {
      margin: 0;
      padding: 0;
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
        <DialogContent className="!w-[1400px] !max-w-[1400px] !h-[700px] !max-h-[700px] bg-gray-100 !p-0 print:fixed print:inset-0 print:max-w-none print:max-h-screen print:p-0 print:m-0 print:bg-white print:rounded-none print:shadow-none print:w-screen print:h-screen print:overflow-visible print:break-inside-avoid overflow-hidden rounded-lg shadow-xl">
          <DialogHeader className="sr-only print:hidden">
            <DialogTitle>Pay Slip</DialogTitle>
            <DialogDescription>
              {period} • {employee.name}
            </DialogDescription>
          </DialogHeader>

          {/* White Paper Container */}
          <div
            id="payslip-content"
            className="w-full h-full bg-white text-slate-900 p-8 print:fixed print:inset-0 print:rounded-none print:shadow-none print:p-10 print:m-0 print:break-inside-avoid overflow-hidden flex flex-col"
          >
          {/* Watermark Overlay - Grayscale & Ultra Faint */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(/logo/company-logo.webp)`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '500px 500px',
              opacity: 0.20,
              filter: 'grayscale(100%)',
            }}
          />

          {/* Content - Landscape Layout */}
          <div className="relative z-10 flex flex-col h-full overflow-hidden">
            {/* Header - Compact Horizontal */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300 flex-shrink-0">
              <div className="flex-1">
                <h1 className="text-lg font-bold text-slate-900">PT Pro Maxima Rajawali</h1>
                <div className="flex gap-4 mt-1 text-xs">
                  <span className="text-slate-600">PAY SLIP</span>
                  <span className="font-semibold text-slate-900">{period}</span>
                </div>
              </div>
              <Badge className={`${statusStyle.badge} text-xs py-1 px-2 h-fit flex-shrink-0`}>
                {employee.status.toUpperCase()}
              </Badge>
            </div>

            {/* Employee Info - Ultra Compact */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 flex-shrink-0">
              <Avatar className="size-10 flex-shrink-0">
                <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                <AvatarFallback className="bg-blue-100 text-blue-900 text-xs font-bold">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-6 text-xs flex-1">
                <div>
                  <p className="text-slate-600 uppercase text-xs font-semibold">Name</p>
                  <p className="font-semibold text-slate-900">{employee.name}</p>
                </div>
                <div>
                  <p className="text-slate-600 uppercase text-xs font-semibold">ID</p>
                  <p className="font-semibold text-slate-900">{employee.id}</p>
                </div>
                <div>
                  <p className="text-slate-600 uppercase text-xs font-semibold">Dept</p>
                  <p className="font-semibold text-slate-900">{employee.department}</p>
                </div>
                <div>
                  <p className="text-slate-600 uppercase text-xs font-semibold">Days</p>
                  <p className="font-semibold text-slate-900">{employee.daysWorked}/{employee.totalDays}</p>
                </div>
              </div>
            </div>

            {/* Main Content - Earnings and Deductions Side by Side */}
            <div className="flex-1 flex gap-6 overflow-hidden mb-3">
              {/* Earnings */}
              <div className="flex-1 border-r border-gray-300 pr-6 overflow-y-auto">
                <h3 className="font-bold text-slate-900 uppercase text-xs mb-2 flex-shrink-0">Earnings</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-slate-700">Base Salary</span>
                    <span className="font-mono font-semibold text-slate-900">{formatCurrency(employee.baseSalary)}</span>
                  </div>
                  {employee.overtimeHours > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Overtime ({employee.overtimeHours}h)</span>
                      <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.overtime)}</span>
                    </div>
                  )}
                  {employee.bonus > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Bonus</span>
                      <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.bonus)}</span>
                    </div>
                  )}
                  {employee.allowances > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Allowances</span>
                      <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.allowances)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold">
                    <span className="text-slate-900 text-xs">Total Gross</span>
                    <span className="font-mono text-green-700">{formatCurrency(totalGross)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="flex-1 pl-6 overflow-y-auto">
                <h3 className="font-bold text-slate-900 uppercase text-xs mb-2 flex-shrink-0">Deductions</h3>
                <div className="space-y-1 text-xs">
                  {employee.taxDeduction > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Income Tax</span>
                      <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.taxDeduction)}</span>
                    </div>
                  )}
                  {employee.insuranceDeduction > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Insurance</span>
                      <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.insuranceDeduction)}</span>
                    </div>
                  )}
                  {employee.otherDeductions > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Other Deductions</span>
                      <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-300 pt-1 mt-1 font-bold">
                    <span className="text-slate-900 text-xs">Total Deductions</span>
                    <span className="font-mono text-red-700">-{formatCurrency(employee.deductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay - Bottom */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded px-4 py-2 flex items-center justify-between flex-shrink-0 mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase">Net Pay</span>
              <span className="font-mono text-lg font-bold text-green-700">{formatCurrency(employee.netPay)}</span>
              <span className="text-xs text-slate-600 ml-auto">{takeHomePercentage}% of gross</span>
            </div>

            {/* Footer */}
            <div className="text-center flex-shrink-0">
              <p className="text-xs text-slate-600">This is an automated pay slip. Please contact HR for discrepancies.</p>
            </div>
          </div>
                </div>
              </div>
              <Badge className={`${statusStyle.badge} text-sm py-1 px-3 h-fit`}>
                {employee.status.toUpperCase()}
              </Badge>
            </div>

            {/* Employee Info - Horizontal Layout */}
            <div className="flex items-center gap-6 border-b-2 border-gray-300 pb-4">
              <Avatar className="size-14 flex-shrink-0">
                <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                <AvatarFallback className="bg-blue-100 text-blue-900 font-bold">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Name</p>
                  <p className="font-semibold text-slate-900">{employee.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">ID</p>
                  <p className="font-semibold text-slate-900">{employee.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Department</p>
                  <p className="font-semibold text-slate-900">{employee.department}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Days</p>
                  <p className="font-semibold text-slate-900">{employee.daysWorked}/{employee.totalDays}</p>
                </div>
              </div>
            </div>

            {/* Main Content Area - Earnings and Deductions Side by Side */}
            <div className="flex-1 grid grid-cols-2 gap-8 border-b-2 border-gray-300 pb-4">
              {/* Earnings Section - Left Column */}
              <div className="border-r-2 border-gray-300 pr-6">
                <h3 className="mb-3 font-bold text-slate-900 uppercase tracking-wide text-xs">Earnings</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-slate-700">Base Salary</span>
                    <span className="font-mono font-semibold text-slate-900">{formatCurrency(employee.baseSalary)}</span>
                  </div>
                  {employee.overtimeHours > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Overtime ({employee.overtimeHours}h)</span>
                      <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.overtime)}</span>
                    </div>
                  )}
                  {employee.bonus > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Bonus</span>
                      <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.bonus)}</span>
                    </div>
                  )}
                  {employee.allowances > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Allowances</span>
                      <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.allowances)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 flex justify-between border-t-2 border-gray-300">
                  <span className="font-bold text-slate-900 uppercase text-xs">Total Gross</span>
                  <span className="font-mono text-sm font-bold text-green-700">
                    {formatCurrency(totalGross)}
                  </span>
                </div>
              </div>

              {/* Deductions Section - Right Column */}
              <div className="pl-6">
                <h3 className="mb-3 font-bold text-slate-900 uppercase tracking-wide text-xs">Deductions</h3>
                <div className="space-y-2 text-xs">
                  {employee.taxDeduction > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Income Tax</span>
                      <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.taxDeduction)}</span>
                    </div>
                  )}
                  {employee.insuranceDeduction > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Insurance</span>
                      <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.insuranceDeduction)}</span>
                    </div>
                  )}
                  {employee.otherDeductions > 0 && (
                    <div className="flex justify-between border-b border-gray-200 pb-1">
                      <span className="text-slate-700">Other Deductions</span>
                      <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.otherDeductions)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 flex justify-between border-t-2 border-gray-300">
                  <span className="font-bold text-slate-900 uppercase text-xs">Total Deductions</span>
                  <span className="font-mono text-sm font-bold text-red-700">
                    -{formatCurrency(employee.deductions)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Pay Section - Bottom */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded px-6 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">Net Pay (Take Home)</span>
                <span className="font-mono text-2xl font-bold text-green-700">
                  {formatCurrency(employee.netPay)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                <span className="font-semibold">{takeHomePercentage}%</span> of gross salary
              </p>
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                This is an automated pay slip. Please contact HR for discrepancies.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="print:hidden flex gap-2 justify-end mt-6 px-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-slate-900"
            onClick={handlePrint}
          >
            <Printer className="mr-2 size-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-slate-900"
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
