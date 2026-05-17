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
  baseSalary: number
  overtime: number
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
    baseSalary: 2800,
    overtime: 450,
    deductions: 280,
    netPay: 2970,
  },
  {
    id: 'EMP002',
    name: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    baseSalary: 2600,
    overtime: 320,
    deductions: 260,
    netPay: 2660,
  },
  {
    id: 'EMP003',
    name: 'David Rodriguez',
    initials: 'DR',
    department: 'Patrol',
    baseSalary: 3200,
    overtime: 580,
    deductions: 320,
    netPay: 3460,
  },
  {
    id: 'EMP004',
    name: 'Emily Johnson',
    initials: 'EJ',
    department: 'Administration',
    baseSalary: 3500,
    overtime: 0,
    deductions: 350,
    netPay: 3150,
  },
  {
    id: 'EMP005',
    name: 'James Wilson',
    initials: 'JW',
    department: 'Field Security',
    baseSalary: 2400,
    overtime: 380,
    deductions: 240,
    netPay: 2540,
  },
  {
    id: 'EMP006',
    name: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    baseSalary: 2200,
    overtime: 0,
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
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Base</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Overtime</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Deductions</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-8">
                                <AvatarImage src={`/avatars/${emp.id}.jpg`} alt={emp.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {emp.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{emp.name}</p>
                                <p className="text-xs text-muted-foreground hidden sm:block">{emp.department}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            ${emp.baseSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm hidden sm:table-cell text-green-600">
                            +${emp.overtime.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm hidden md:table-cell text-red-600">
                            -${emp.deductions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-medium">
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
