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

export function PayslipDrawer({ open, onOpenChange, employee, period }: PayslipDrawerProps) {
  if (!employee) return null

  const statusStyle = statusColors[employee.status]
  const totalGross = employee.baseSalary + employee.overtime + employee.bonus + employee.allowances
  const takeHomePercentage = ((employee.netPay / totalGross) * 100).toFixed(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-100 p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Pay Slip</DialogTitle>
          <DialogDescription>
            {period} • {employee.name}
          </DialogDescription>
        </DialogHeader>

        {/* White Paper Container */}
        <div 
          className="relative bg-white text-slate-900 rounded-lg shadow-2xl p-10 overflow-hidden"
        >
          {/* Watermark Overlay - Grayscale & Ultra Faint */}
          <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(/logo/company-logo.webp)`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '500px 500px',
              opacity: 0.03,
              filter: 'grayscale(100%)',
            }}
          />

          {/* Content Container - Front Layer */}
          <div className="relative z-10 space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between border-b-2 border-gray-300 pb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">PT Pro Maxima Rajawali</h1>
                <h2 className="text-lg font-semibold text-slate-700">PAY SLIP</h2>
                <p className="text-sm text-slate-600">For the period: {period}</p>
              </div>
              <Badge className={`${statusStyle.badge} text-sm py-1 px-3`}>
                {employee.status.toUpperCase()}
              </Badge>
            </div>

            {/* Employee Info Section */}
            <div className="border-b-2 border-gray-300 pb-6">
              <div className="flex items-start gap-6">
                <Avatar className="size-16 flex-shrink-0">
                  <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-900 text-lg font-bold">
                    {employee.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Employee Name</p>
                    <p className="text-base font-semibold text-slate-900 mt-1">{employee.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Employee ID</p>
                    <p className="text-base font-semibold text-slate-900 mt-1">{employee.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Department</p>
                    <p className="text-base font-semibold text-slate-900 mt-1">{employee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Days Worked</p>
                    <p className="text-base font-semibold text-slate-900 mt-1">{employee.daysWorked}/{employee.totalDays}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="border-b-2 border-gray-300 pb-6">
              <h3 className="mb-4 font-bold text-slate-900 uppercase tracking-wide">Earnings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-slate-700">Base Salary</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(employee.baseSalary)}</span>
                </div>
                {employee.overtimeHours > 0 && (
                  <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                    <span className="text-slate-700">Overtime ({employee.overtimeHours}h @ {formatCurrency(employee.overtimeRate)}/hr)</span>
                    <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.overtime)}</span>
                  </div>
                )}
                {employee.bonus > 0 && (
                  <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                    <span className="text-slate-700">Bonus</span>
                    <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.bonus)}</span>
                  </div>
                )}
                {employee.allowances > 0 && (
                  <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                    <span className="text-slate-700">Allowances</span>
                    <span className="font-mono font-semibold text-green-700">+{formatCurrency(employee.allowances)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 flex justify-between border-t-2 border-gray-300">
                <span className="font-bold text-slate-900 uppercase text-sm">Total Gross</span>
                <span className="font-mono text-lg font-bold text-green-700">
                  {formatCurrency(totalGross)}
                </span>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="border-b-2 border-gray-300 pb-6">
              <h3 className="mb-4 font-bold text-slate-900 uppercase tracking-wide">Deductions</h3>
              <div className="space-y-3">
                {employee.taxDeduction > 0 && (
                  <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                    <span className="text-slate-700">Income Tax</span>
                    <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.taxDeduction)}</span>
                  </div>
                )}
                {employee.insuranceDeduction > 0 && (
                  <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                    <span className="text-slate-700">Insurance</span>
                    <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.insuranceDeduction)}</span>
                  </div>
                )}
                {employee.otherDeductions > 0 && (
                  <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                    <span className="text-slate-700">Other Deductions</span>
                    <span className="font-mono font-semibold text-red-700">-{formatCurrency(employee.otherDeductions)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 flex justify-between border-t-2 border-gray-300">
                <span className="font-bold text-slate-900 uppercase text-sm">Total Deductions</span>
                <span className="font-mono text-lg font-bold text-red-700">
                  -{formatCurrency(employee.deductions)}
                </span>
              </div>
            </div>

            {/* Net Pay Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900 uppercase tracking-wide">Net Pay (Take Home)</span>
                <span className="font-mono text-3xl font-bold text-green-700">
                  {formatCurrency(employee.netPay)}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                <span className="font-semibold">{takeHomePercentage}%</span> of gross salary
              </p>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-6 text-center">
              <p className="text-xs text-slate-600">
                This is an automated pay slip. Please contact HR for discrepancies.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mt-6 px-4">
          <Button variant="outline" size="sm" className="text-slate-900">
            <Printer className="mr-2 size-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="text-slate-900">
            <Download className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
