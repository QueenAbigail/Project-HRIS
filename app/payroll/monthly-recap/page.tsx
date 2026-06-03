'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Download, FileText, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CompanyRecord {
  id: string
  companyName: string
  totalEmployees: number
  totalPayroll: number
  totalDeductions: number
  netPayroll: number
  averagePerEmployee: number
  status: 'completed' | 'pending' | 'review'
}

const mockRecords: CompanyRecord[] = [
  {
    id: '1',
    companyName: 'PT Pro Maxima Rajawali',
    totalEmployees: 45,
    totalPayroll: 542890000,
    totalDeductions: 125000000,
    netPayroll: 417890000,
    averagePerEmployee: 12062000,
    status: 'completed',
  },
  {
    id: '2',
    companyName: 'PT Security Solutions',
    totalEmployees: 28,
    totalPayroll: 325000000,
    totalDeductions: 78000000,
    netPayroll: 247000000,
    averagePerEmployee: 11607143,
    status: 'completed',
  },
  {
    id: '3',
    companyName: 'PT Facility Management',
    totalEmployees: 32,
    totalPayroll: 380000000,
    totalDeductions: 92000000,
    netPayroll: 288000000,
    averagePerEmployee: 11875000,
    status: 'pending',
  },
]

export default function MonthlyRecapPage() {
  const [selectedMonth, setSelectedMonth] = useState('march-2026')
  const [selectedCompany, setSelectedCompany] = useState('all')

  const filteredRecords = selectedCompany === 'all' 
    ? mockRecords 
    : mockRecords.filter(r => r.id === selectedCompany)

  const totalPayroll = filteredRecords.reduce((sum, r) => sum + r.totalPayroll, 0)
  const totalDeductions = filteredRecords.reduce((sum, r) => sum + r.totalDeductions, 0)
  const totalNetPayroll = filteredRecords.reduce((sum, r) => sum + r.netPayroll, 0)
  const totalEmployees = filteredRecords.reduce((sum, r) => sum + r.totalEmployees, 0)

  const statusStyles = {
    completed: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    review: 'bg-chart-2/10 text-chart-2',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monthly Recap</h1>
        <p className="text-muted-foreground">
          Company payroll records and summary reports
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 flex-1">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="march-2026">March 2026</SelectItem>
              <SelectItem value="february-2026">February 2026</SelectItem>
              <SelectItem value="january-2026">January 2026</SelectItem>
              <SelectItem value="december-2025">December 2025</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {mockRecords.map(record => (
                <SelectItem key={record.id} value={record.id}>
                  {record.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full sm:w-auto">
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalPayroll)}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalEmployees} employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDeductions)}</p>
            <p className="text-xs text-muted-foreground mt-1">{((totalDeductions / totalPayroll) * 100).toFixed(1)}% of payroll</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalNetPayroll)}</p>
            <p className="text-xs text-muted-foreground mt-1">After deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Per Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalNetPayroll / totalEmployees)}</p>
            <p className="text-xs text-muted-foreground mt-1">Net average</p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Records</CardTitle>
          <CardDescription>
            Detailed payroll summary for {selectedMonth.replace('-', ' ')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Total Payroll</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Payroll</TableHead>
                  <TableHead className="text-right">Avg/Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.companyName}</TableCell>
                    <TableCell className="text-right text-sm">{record.totalEmployees}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(record.totalPayroll)}</TableCell>
                    <TableCell className="text-right text-sm text-destructive">{formatCurrency(record.totalDeductions)}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-success">{formatCurrency(record.netPayroll)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(record.averagePerEmployee)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[record.status]}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <FileText className="size-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
