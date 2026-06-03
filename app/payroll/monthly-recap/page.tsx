'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, Eye, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MonthlyRecord {
  id: string
  month: string
  date: string
  totalEmployees: number
  totalPayroll: number
  totalDeductions: number
  totalTax: number
  totalInsurance: number
  totalBonus: number
  netPayroll: number
  averagePerEmployee: number
  status: 'completed' | 'pending' | 'review'
  lastUpdated: string
}

interface DetailedRecord {
  employeeId: string
  employeeName: string
  basePay: number
  overtime: number
  bonus: number
  deductions: number
  tax: number
  netPay: number
}

// Mock monthly data for PT Pro Maxima Rajawali
const mockMonthlyRecords: MonthlyRecord[] = [
  {
    id: '1',
    month: 'March 2026',
    date: '2026-03-31',
    totalEmployees: 45,
    totalPayroll: 542890000,
    totalDeductions: 125000000,
    totalTax: 75000000,
    totalInsurance: 35000000,
    totalBonus: 28000000,
    netPayroll: 417890000,
    averagePerEmployee: 12062000,
    status: 'completed',
    lastUpdated: '2026-03-17 12:00 AM',
  },
  {
    id: '2',
    month: 'February 2026',
    date: '2026-02-28',
    totalEmployees: 45,
    totalPayroll: 518000000,
    totalDeductions: 119000000,
    totalTax: 70000000,
    totalInsurance: 33000000,
    totalBonus: 0,
    netPayroll: 399000000,
    averagePerEmployee: 11511111,
    status: 'completed',
    lastUpdated: '2026-03-01 08:30 AM',
  },
  {
    id: '3',
    month: 'January 2026',
    date: '2026-01-31',
    totalEmployees: 44,
    totalPayroll: 525000000,
    totalDeductions: 122000000,
    totalTax: 72000000,
    totalInsurance: 34000000,
    totalBonus: 35000000,
    netPayroll: 403000000,
    averagePerEmployee: 11932000,
    status: 'completed',
    lastUpdated: '2026-02-02 10:15 AM',
  },
  {
    id: '4',
    month: 'December 2025',
    date: '2025-12-31',
    totalEmployees: 44,
    totalPayroll: 612000000,
    totalDeductions: 142000000,
    totalTax: 82000000,
    totalInsurance: 36000000,
    totalBonus: 50000000,
    netPayroll: 470000000,
    averagePerEmployee: 13864000,
    status: 'completed',
    lastUpdated: '2026-01-05 14:20 AM',
  },
]

const mockDetailedRecords: Record<string, DetailedRecord[]> = {
  '1': [
    { employeeId: 'E001', employeeName: 'Michael Chen', basePay: 12000000, overtime: 1500000, bonus: 500000, deductions: 2500000, tax: 1500000, netPay: 10000000 },
    { employeeId: 'E002', employeeName: 'Sarah Williams', basePay: 11000000, overtime: 800000, bonus: 400000, deductions: 2200000, tax: 1300000, netPay: 8700000 },
    { employeeId: 'E003', employeeName: 'David Rodriguez', basePay: 10500000, overtime: 1200000, bonus: 300000, deductions: 2100000, tax: 1200000, netPay: 8700000 },
  ],
}

export default function MonthlyRecapPage() {
  const [loading, setLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MonthlyRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailedRecords, setDetailedRecords] = useState<DetailedRecord[]>([])

  // Current month is the latest (March 2026)
  const latestRecord = mockMonthlyRecords[0]
  const previousRecord = mockMonthlyRecords[1]
  
  // Calculate trends
  const payrollTrend = latestRecord.totalPayroll - previousRecord.totalPayroll
  const payrollTrendPercent = ((payrollTrend / previousRecord.totalPayroll) * 100).toFixed(1)
  
  const bonusTrend = latestRecord.totalBonus - previousRecord.totalBonus
  const bonusTrendPercent = previousRecord.totalBonus > 0 
    ? ((bonusTrend / previousRecord.totalBonus) * 100).toFixed(1)
    : '0'
  
  const netPayrollTrend = latestRecord.netPayroll - previousRecord.netPayroll
  const netPayrollTrendPercent = ((netPayrollTrend / previousRecord.netPayroll) * 100).toFixed(1)

  useEffect(() => {
    if (selectedRecord) {
      setLoading(true)
      setTimeout(() => {
        setDetailedRecords(mockDetailedRecords[selectedRecord.id] || [])
        setLoading(false)
      }, 500)
    }
  }, [selectedRecord])

  const statusStyles = {
    completed: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    review: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  }

  const handleViewDetails = (record: MonthlyRecord) => {
    setSelectedRecord(record)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Recap</h1>
          <p className="text-muted-foreground">
            PT Pro Maxima Rajawali - Monthly payroll records and history
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Current Month Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(latestRecord.totalPayroll)}</p>
            <p className="text-xs text-muted-foreground mt-1">{latestRecord.totalEmployees} employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Bonus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(latestRecord.totalBonus)}</p>
            <p className="text-xs text-muted-foreground mt-1">{latestRecord.month}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(latestRecord.totalDeductions)}</p>
            <p className="text-xs text-muted-foreground mt-1">{((latestRecord.totalDeductions / latestRecord.totalPayroll) * 100).toFixed(1)}% of payroll</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(latestRecord.netPayroll)}</p>
            <p className="text-xs text-muted-foreground mt-1">After deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Per Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(latestRecord.averagePerEmployee)}</p>
            <p className="text-xs text-muted-foreground mt-1">Net average</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Indicators */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {payrollTrend >= 0 ? (
                <TrendingUp className="size-5 text-success" />
              ) : (
                <TrendingDown className="size-5 text-destructive" />
              )}
              <span className={`text-lg font-semibold ${payrollTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {payrollTrend >= 0 ? '+' : ''}{payrollTrendPercent}%
              </span>
              <span className="text-sm text-muted-foreground">vs {previousRecord.month}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatCurrency(Math.abs(payrollTrend))} difference</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bonus Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {bonusTrend > 0 ? (
                <TrendingUp className="size-5 text-success" />
              ) : bonusTrend < 0 ? (
                <TrendingDown className="size-5 text-destructive" />
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
              <span className={`text-lg font-semibold ${bonusTrend > 0 ? 'text-success' : bonusTrend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {bonusTrend >= 0 ? '+' : ''}{bonusTrendPercent}%
              </span>
              <span className="text-sm text-muted-foreground">vs {previousRecord.month}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatCurrency(Math.abs(bonusTrend))} difference</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {netPayrollTrend >= 0 ? (
                <TrendingUp className="size-5 text-success" />
              ) : (
                <TrendingDown className="size-5 text-destructive" />
              )}
              <span className={`text-lg font-semibold ${netPayrollTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {netPayrollTrend >= 0 ? '+' : ''}{netPayrollTrendPercent}%
              </span>
              <span className="text-sm text-muted-foreground">vs {previousRecord.month}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{formatCurrency(Math.abs(netPayrollTrend))} difference</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly History</CardTitle>
          <CardDescription>
            Payroll records for PT Pro Maxima Rajawali over the past months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Total Payroll</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Payroll</TableHead>
                  <TableHead className="text-right">Avg/Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMonthlyRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.month}</TableCell>
                    <TableCell className="text-right text-sm">{record.totalEmployees}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(record.totalPayroll)}</TableCell>
                    <TableCell className="text-right text-sm text-success">{formatCurrency(record.totalBonus)}</TableCell>
                    <TableCell className="text-right text-sm text-destructive">{formatCurrency(record.totalDeductions)}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-success">{formatCurrency(record.netPayroll)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(record.averagePerEmployee)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[record.status]}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(record)}
                      >
                        <Eye className="size-4" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Monthly Payroll Details</DialogTitle>
            <DialogDescription>
              PT Pro Maxima Rajawali - {selectedRecord?.month}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Payroll</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(selectedRecord.totalPayroll)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Tax & Insurance</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(selectedRecord.totalTax + selectedRecord.totalInsurance)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Bonus Paid</p>
                  <p className="text-2xl font-bold text-success mt-2">{formatCurrency(selectedRecord.totalBonus)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Payroll</p>
                  <p className="text-2xl font-bold text-success mt-2">{formatCurrency(selectedRecord.netPayroll)}</p>
                </div>
              </div>

              {/* Employee Details Table */}
              <div>
                <h3 className="font-semibold mb-4">Employee Breakdown</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Base Pay</TableHead>
                          <TableHead className="text-right">Overtime</TableHead>
                          <TableHead className="text-right">Bonus</TableHead>
                          <TableHead className="text-right">Deductions</TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                          <TableHead className="text-right">Net Pay</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedRecords.map((record) => (
                          <TableRow key={record.employeeId}>
                            <TableCell className="font-medium">{record.employeeName}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(record.basePay)}</TableCell>
                            <TableCell className="text-right text-sm text-success">{formatCurrency(record.overtime)}</TableCell>
                            <TableCell className="text-right text-sm text-success">{formatCurrency(record.bonus)}</TableCell>
                            <TableCell className="text-right text-sm text-destructive">{formatCurrency(record.deductions)}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(record.tax)}</TableCell>
                            <TableCell className="text-right text-sm font-medium">{formatCurrency(record.netPay)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Last Updated Info */}
              <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
                Last calculated: {selectedRecord.lastUpdated}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface DetailedRecord {
  employeeId: string
  employeeName: string
  basePay: number
  overtime: number
  bonus: number
  deductions: number
  tax: number
  netPay: number
}

// Mock data - will be replaced with API calls
const mockRecords: CompanyRecord[] = [
  {
    id: '1',
    companyName: 'PT Pro Maxima Rajawali',
    totalEmployees: 45,
    totalPayroll: 542890000,
    totalDeductions: 125000000,
    totalTax: 75000000,
    totalInsurance: 35000000,
    totalBonus: 28000000,
    netPayroll: 417890000,
    averagePerEmployee: 12062000,
    status: 'completed',
    lastUpdated: '2026-03-17 12:00 AM',
  },
  {
    id: '2',
    companyName: 'PT Security Solutions',
    totalEmployees: 28,
    totalPayroll: 325000000,
    totalDeductions: 78000000,
    totalTax: 48000000,
    totalInsurance: 20000000,
    totalBonus: 15000000,
    netPayroll: 247000000,
    averagePerEmployee: 11607143,
    status: 'completed',
    lastUpdated: '2026-03-17 12:00 AM',
  },
  {
    id: '3',
    companyName: 'PT Facility Management',
    totalEmployees: 32,
    totalPayroll: 380000000,
    totalDeductions: 92000000,
    totalTax: 58000000,
    totalInsurance: 24000000,
    totalBonus: 18000000,
    netPayroll: 288000000,
    averagePerEmployee: 11875000,
    status: 'pending',
    lastUpdated: '2026-03-16 08:30 AM',
  },
]

const mockDetailedRecords: Record<string, DetailedRecord[]> = {
  '1': [
    { employeeId: 'E001', employeeName: 'Michael Chen', basePay: 12000000, overtime: 1500000, bonus: 500000, deductions: 2500000, tax: 1500000, netPay: 10000000 },
    { employeeId: 'E002', employeeName: 'Sarah Williams', basePay: 11000000, overtime: 800000, bonus: 400000, deductions: 2200000, tax: 1300000, netPay: 8700000 },
  ],
}
