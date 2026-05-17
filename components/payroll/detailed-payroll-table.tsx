'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/currency'
import { PayslipDrawer } from './payslip-drawer'

interface DetailedPayrollEmployee {
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

const detailedPayrollData: DetailedPayrollEmployee[] = [
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
    status: 'paid',
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
    status: 'paid',
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
    status: 'pending',
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
    status: 'paid',
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
    status: 'paid',
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
    status: 'pending',
  },
]

const statusStyles: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function DetailedPayrollTable() {
  const [selectedEmployee, setSelectedEmployee] = useState<DetailedPayrollEmployee | null>(null)
  const [openPayslip, setOpenPayslip] = useState(false)

  const handleEmployeeClick = (employee: DetailedPayrollEmployee) => {
    setSelectedEmployee(employee)
    setOpenPayslip(true)
  }
  return (
    <>
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Payroll Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Employee</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Days</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Daily Rate</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Base Pay</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">OT Hours</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">OT Amt</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Bonus</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Allowances</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Tax</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Insurance</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Other</TableHead>
                <TableHead className="text-right text-xs whitespace-nowrap">Net Pay</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailedPayrollData.map((record) => (
                <TableRow 
                  key={record.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEmployeeClick(record)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={`/avatars/${record.id}.jpg`} alt={record.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {record.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block">
                        <p className="font-medium text-xs">{record.name}</p>
                        <p className="text-xs text-muted-foreground">{record.department}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {record.daysWorked}/{record.totalDays}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(record.dailyRate)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold">
                    {formatCurrency(record.baseSalary)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600">
                    {record.overtimeHours}h
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600 font-semibold">
                    +{formatCurrency(record.overtime)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600">
                    +{formatCurrency(record.bonus)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600">
                    +{formatCurrency(record.allowances)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-red-600">
                    -{formatCurrency(record.taxDeduction)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-red-600">
                    -{formatCurrency(record.insuranceDeduction)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-red-600">
                    -{formatCurrency(record.otherDeductions)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded">
                    {formatCurrency(record.netPay)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[record.status]}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <PayslipDrawer 
      open={openPayslip}
      onOpenChange={setOpenPayslip}
      employee={selectedEmployee}
      period="March 2026"
    />
    </>
  )
}
