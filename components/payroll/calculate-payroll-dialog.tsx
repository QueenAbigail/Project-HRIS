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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertCircle, CheckCircle2, Download, Send } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PayrollEmployee {
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
}

interface CalculatePayrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const employeeData: PayrollEmployee[] = [
  {
    id: 'EMP001',
    name: 'Michael Chen',
    initials: 'MC',
    department: 'Field Security',
    daysWorked: 22,
    totalDays: 22,
    dailyRate: 127.27,
    baseSalary: 2800,
    overtimeHours: 18,
    overtimeRate: 25,
    overtime: 450,
    bonus: 0,
    allowances: 150,
    taxDeduction: 150,
    insuranceDeduction: 80,
    otherDeductions: 50,
    deductions: 280,
    netPay: 2970,
  },
  {
    id: 'EMP002',
    name: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    daysWorked: 21,
    totalDays: 22,
    dailyRate: 118.18,
    baseSalary: 2600,
    overtimeHours: 12.8,
    overtimeRate: 25,
    overtime: 320,
    bonus: 100,
    allowances: 100,
    taxDeduction: 140,
    insuranceDeduction: 80,
    otherDeductions: 40,
    deductions: 260,
    netPay: 2660,
  },
  {
    id: 'EMP003',
    name: 'David Rodriguez',
    initials: 'DR',
    department: 'Patrol',
    daysWorked: 22,
    totalDays: 22,
    dailyRate: 145.45,
    baseSalary: 3200,
    overtimeHours: 23.2,
    overtimeRate: 25,
    overtime: 580,
    bonus: 200,
    allowances: 200,
    taxDeduction: 160,
    insuranceDeduction: 100,
    otherDeductions: 60,
    deductions: 320,
    netPay: 3460,
  },
  {
    id: 'EMP004',
    name: 'Emily Johnson',
    initials: 'EJ',
    department: 'Administration',
    daysWorked: 20,
    totalDays: 22,
    dailyRate: 159.09,
    baseSalary: 3500,
    overtimeHours: 0,
    overtimeRate: 0,
    overtime: 0,
    bonus: 300,
    allowances: 200,
    taxDeduction: 175,
    insuranceDeduction: 100,
    otherDeductions: 75,
    deductions: 350,
    netPay: 3150,
  },
  {
    id: 'EMP005',
    name: 'James Wilson',
    initials: 'JW',
    department: 'Field Security',
    daysWorked: 20,
    totalDays: 22,
    dailyRate: 109.09,
    baseSalary: 2400,
    overtimeHours: 15.2,
    overtimeRate: 25,
    overtime: 380,
    bonus: 50,
    allowances: 100,
    taxDeduction: 120,
    insuranceDeduction: 80,
    otherDeductions: 40,
    deductions: 240,
    netPay: 2540,
  },
  {
    id: 'EMP006',
    name: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    daysWorked: 20,
    totalDays: 22,
    dailyRate: 100,
    baseSalary: 2200,
    overtimeHours: 0,
    overtimeRate: 0,
    overtime: 0,
    bonus: 0,
    allowances: 80,
    taxDeduction: 110,
    insuranceDeduction: 80,
    otherDeductions: 30,
    deductions: 220,
    netPay: 1980,
  },
]

export function CalculatePayrollDialog({
  open,
  onOpenChange,
}: CalculatePayrollDialogProps) {
  const [month, setMonth] = useState('march-2026')
  const [department, setDepartment] = useState('all')
  const [includeOvertime, setIncludeOvertime] = useState('true')
  const [isLoading, setIsLoading] = useState(false)
  const [isCalculated, setIsCalculated] = useState(false)
  const [filteredEmployees, setFilteredEmployees] = useState<PayrollEmployee[]>([])

  const calculatePayroll = () => {
    setIsLoading(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      let filtered = employeeData

      // Filter by department
      if (department !== 'all') {
        filtered = filtered.filter(emp => 
          emp.department.toLowerCase().includes(department.toLowerCase())
        )
      }

      // Filter by overtime if needed
      if (includeOvertime === 'false') {
        filtered = filtered.map(emp => ({
          ...emp,
          overtime: 0,
          netPay: emp.baseSalary + emp.deductions,
        }))
      }

      setFilteredEmployees(filtered)
      setIsCalculated(true)
      setIsLoading(false)
    }, 1500)
  }

  const handleClose = () => {
    setIsCalculated(false)
    setFilteredEmployees([])
    setMonth('march-2026')
    setDepartment('all')
    setIncludeOvertime('true')
    onOpenChange(false)
  }

  const calculateTotals = () => {
    return {
      totalGross: filteredEmployees.reduce((sum, emp) => sum + emp.baseSalary + emp.overtime, 0),
      totalDeductions: filteredEmployees.reduce((sum, emp) => sum + emp.deductions, 0),
      totalNet: filteredEmployees.reduce((sum, emp) => sum + emp.netPay, 0),
    }
  }

  const totals = calculateTotals()


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCalculated ? 'Payroll Preview' : 'Calculate Payroll'}
          </DialogTitle>
          <DialogDescription>
            {isCalculated 
              ? `Review payroll data for ${month.replace('-', ' ').toUpperCase()}`
              : 'Select period and filters to preview payroll'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Form - Show only when not calculated */}
          {!isCalculated && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

          {/* Payroll Summary */}
          {isCalculated && (
            <div className="space-y-4">
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Payroll calculated successfully for {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} in {month.replace('-', ' ').toUpperCase()}
                </AlertDescription>
              </Alert>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Gross</p>
                  <p className="text-lg font-bold">
                    ${totals.totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Deductions</p>
                  <p className="text-lg font-bold text-red-600">
                    -${totals.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Net</p>
                  <p className="text-lg font-bold text-green-600">
                    ${totals.totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Employee Details Table */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Employee</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Days</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Daily Rate</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Base Pay</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">OT Hours</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">OT Amount</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Bonus</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Allowances</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Tax</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Insurance</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Other Ded.</TableHead>
                        <TableHead className="text-right text-xs whitespace-nowrap">Net Pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((emp) => (
                        <TableRow key={emp.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-8">
                                <AvatarImage src={`/avatars/${emp.id}.jpg`} alt={emp.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {emp.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="hidden sm:block">
                                <p className="font-medium text-xs">{emp.name}</p>
                                <p className="text-xs text-muted-foreground">{emp.department}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {emp.daysWorked}/{emp.totalDays}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ${emp.dailyRate.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ${emp.baseSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-green-600">
                            {emp.overtimeHours}h
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-green-600">
                            +${emp.overtime.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-green-600">
                            +${emp.bonus.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-green-600">
                            +${emp.allowances.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-red-600">
                            -${emp.taxDeduction.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-red-600">
                            -${emp.insuranceDeduction.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-red-600">
                            -${emp.otherDeductions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-bold text-green-700 bg-green-50">
                            ${emp.netPay.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
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
          {!isCalculated ? (
            <Button
              onClick={calculatePayroll}
              disabled={isLoading}
            >
              {isLoading ? 'Calculating...' : 'Calculate Payroll'}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsCalculated(false)}
              >
                <Download className="mr-2 size-4" />
                Export
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Send className="mr-2 size-4" />
                Process Payment
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
