'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CalculatePayrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalculatePayrollDialog({
  open,
  onOpenChange,
}: CalculatePayrollDialogProps) {
  const [month, setMonth] = useState('march-2026')
  const [department, setDepartment] = useState('all')
  const [includeOvertime, setIncludeOvertime] = useState('true')
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculated, setIsCalculated] = useState(false)
  const [summary, setSummary] = useState<{
    employeeCount: number
    totalGross: number
    totalDeductions: number
    totalNet: number
  } | null>(null)

  const calculatePayroll = () => {
    setIsLoading(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      setSummary({
        employeeCount: department === 'all' ? 6 : 2,
        totalGross: department === 'all' ? 16350 : 5400,
        totalDeductions: department === 'all' ? 1630 : 540,
        totalNet: department === 'all' ? 14720 : 4860,
      })
      setIsCalculated(true)
      setIsLoading(false)
    }, 1500)
  }

  const handleClose = () => {
    setIsCalculated(false)
    setSummary(null)
    setMonth('march-2026')
    setDepartment('all')
    setIncludeOvertime('true')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCalculated ? 'Payroll Calculated' : 'Calculate Payroll'}
          </DialogTitle>
          <DialogDescription>
            {isCalculated 
              ? 'Review the summary below. Detailed payroll is shown on the main page.'
              : 'Select period and filters to calculate payroll'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Form - Show only when not calculated */}
          {!isCalculated && (
            <div className="space-y-4">
              {/* Month Selection */}
              <div className="space-y-2">
                <Label htmlFor="month">
                  Period <span className="text-red-500">*</span>
                </Label>
                <Select value={month} onValueChange={setMonth} disabled={isLoading}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="march-2026">March 2026</SelectItem>
                    <SelectItem value="february-2026">February 2026</SelectItem>
                    <SelectItem value="january-2026">January 2026</SelectItem>
                    <SelectItem value="december-2025">December 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment} disabled={isLoading}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="field">Field Security</SelectItem>
                    <SelectItem value="surveillance">Surveillance</SelectItem>
                    <SelectItem value="patrol">Patrol</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include Overtime */}
              <div className="space-y-2">
                <Label htmlFor="overtime">Include Overtime</Label>
                <Select value={includeOvertime} onValueChange={setIncludeOvertime} disabled={isLoading}>
                  <SelectTrigger id="overtime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes, Include</SelectItem>
                    <SelectItem value="false">No, Exclude</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Calculating payroll... Please wait.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary */}
          {isCalculated && summary && (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Payroll calculated successfully for {summary.employeeCount} employees in {month.replace('-', ' ').toUpperCase()}
                </AlertDescription>
              </Alert>

              {/* Summary Stats */}
              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-semibold">{summary.employeeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Gross:</span>
                  <span className="font-semibold">
                    ${summary.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Deductions:</span>
                  <span className="font-semibold text-red-600">
                    -${summary.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="font-semibold">Total Net:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${summary.totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Detailed payroll breakdown is displayed on the main page.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {isCalculated ? 'Close' : 'Cancel'}
          </Button>
          {!isCalculated && (
            <Button
              onClick={calculatePayroll}
              disabled={isLoading}
            >
              {isLoading ? 'Calculating...' : 'Calculate Payroll'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
