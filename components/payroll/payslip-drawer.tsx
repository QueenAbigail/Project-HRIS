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

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  paid: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
}

export function PayslipDrawer({ open, onOpenChange, employee, period }: PayslipDrawerProps) {
  if (!employee) return null

  const statusStyle = statusColors[employee.status]
  const totalGross = employee.baseSalary + employee.overtime + employee.bonus + employee.allowances
  const takeHomePercentage = ((employee.netPay / totalGross) * 100).toFixed(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Slip</DialogTitle>
          <DialogDescription>
            {period} • {employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4">
          {/* Pay Slip Container */}
          <div className={`rounded-lg border-2 border-gray-300 ${statusStyle.bg}`}>
            {/* Header Section */}
            <div className="border-b-2 border-gray-300 px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-gray-600">PAYSLIP</h2>
                  <p className="text-xs text-muted-foreground">For the period: {period}</p>
                </div>
                <Badge className={statusStyle.badge}>
                  {employee.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Employee Info Section */}
            <div className="border-b-2 border-gray-300 px-8 py-6">
              <div className="flex items-start gap-4">
                <Avatar className="size-12">
                  <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {employee.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Employee Name</p>
                      <p className="font-semibold">{employee.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employee ID</p>
                      <p className="font-semibold">{employee.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="font-semibold">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days Worked</p>
                      <p className="font-semibold">{employee.daysWorked}/{employee.totalDays}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="border-b-2 border-gray-300 px-8 py-6">
              <h3 className="mb-4 font-semibold text-gray-700">EARNINGS</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-mono font-semibold">${employee.baseSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {employee.overtimeHours > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overtime ({employee.overtimeHours}h @ ${employee.overtimeRate.toFixed(2)}/hr)</span>
                    <span className="font-mono font-semibold text-green-700">+${employee.overtime.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {employee.bonus > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bonus</span>
                    <span className="font-mono font-semibold text-green-700">+${employee.bonus.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {employee.allowances > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Allowances</span>
                    <span className="font-mono font-semibold text-green-700">+${employee.allowances.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 border-t-2 border-gray-300 pt-4 flex justify-between">
                <span className="font-semibold">Total Gross</span>
                <span className="font-mono text-lg font-bold text-green-700">
                  ${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="border-b-2 border-gray-300 px-8 py-6">
              <h3 className="mb-4 font-semibold text-gray-700">DEDUCTIONS</h3>
              <div className="space-y-2">
                {employee.taxDeduction > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Income Tax</span>
                    <span className="font-mono font-semibold text-red-700">-${employee.taxDeduction.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {employee.insuranceDeduction > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="font-mono font-semibold text-red-700">-${employee.insuranceDeduction.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {employee.otherDeductions > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Other Deductions</span>
                    <span className="font-mono font-semibold text-red-700">-${employee.otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 border-t-2 border-gray-300 pt-4 flex justify-between">
                <span className="font-semibold">Total Deductions</span>
                <span className="font-mono text-lg font-bold text-red-700">
                  -${employee.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Net Pay Section */}
            <div className="px-8 py-6 bg-green-100">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">NET PAY (Take Home)</span>
                <span className="font-mono text-2xl font-bold text-green-700">
                  ${employee.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {takeHomePercentage}% of gross salary
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 size-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
