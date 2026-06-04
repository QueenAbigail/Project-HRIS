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
import { Download, Eye, Loader2, TrendingUp, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SiteDetail {
  siteId: string
  siteName: string
  location: string
  employees: number
  payroll: number
  bonus: number
  deductions: number
  netPayroll: number
}

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
  sites?: SiteDetail[]
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

// Mock site data for each month
const mockSiteDetails: Record<string, SiteDetail[]> = {
  '1': [
    { siteId: 'S1', siteName: 'Head Office', location: 'Jakarta', employees: 18, payroll: 245000000, bonus: 12000000, deductions: 55000000, netPayroll: 190000000 },
    { siteId: 'S2', siteName: 'Regional Office', location: 'Surabaya', employees: 15, payroll: 185000000, bonus: 9000000, deductions: 42000000, netPayroll: 143000000 },
    { siteId: 'S3', siteName: 'Branch Office', location: 'Bandung', employees: 12, payroll: 112890000, bonus: 7000000, deductions: 28000000, netPayroll: 84890000 },
  ],
  '2': [
    { siteId: 'S1', siteName: 'Head Office', location: 'Jakarta', employees: 18, payroll: 235000000, bonus: 0, deductions: 52000000, netPayroll: 183000000 },
    { siteId: 'S2', siteName: 'Regional Office', location: 'Surabaya', employees: 15, payroll: 175000000, bonus: 0, deductions: 40000000, netPayroll: 135000000 },
    { siteId: 'S3', siteName: 'Branch Office', location: 'Bandung', employees: 12, payroll: 108000000, bonus: 0, deductions: 27000000, netPayroll: 81000000 },
  ],
  '3': [
    { siteId: 'S1', siteName: 'Head Office', location: 'Jakarta', employees: 18, payroll: 240000000, bonus: 15000000, deductions: 53000000, netPayroll: 187000000 },
    { siteId: 'S2', siteName: 'Regional Office', location: 'Surabaya', employees: 15, payroll: 180000000, bonus: 12000000, deductions: 41000000, netPayroll: 139000000 },
    { siteId: 'S3', siteName: 'Branch Office', location: 'Bandung', employees: 11, payroll: 105000000, bonus: 8000000, deductions: 28000000, netPayroll: 77000000 },
  ],
  '4': [
    { siteId: 'S1', siteName: 'Head Office', location: 'Jakarta', employees: 18, payroll: 280000000, bonus: 22000000, deductions: 62000000, netPayroll: 218000000 },
    { siteId: 'S2', siteName: 'Regional Office', location: 'Surabaya', employees: 15, payroll: 210000000, bonus: 18000000, deductions: 47000000, netPayroll: 163000000 },
    { siteId: 'S3', siteName: 'Branch Office', location: 'Bandung', employees: 11, payroll: 122000000, bonus: 10000000, deductions: 33000000, netPayroll: 89000000 },
  ],
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
    sites: mockSiteDetails['1'],
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
    sites: mockSiteDetails['2'],
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
    sites: mockSiteDetails['3'],
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
    sites: mockSiteDetails['4'],
  },
]

const mockDetailedRecords: Record<string, DetailedRecord[]> = {
  '1': [
    { employeeId: 'E001', employeeName: 'Michael Chen', basePay: 12000000, overtime: 1500000, bonus: 500000, deductions: 2500000, tax: 1500000, netPay: 10000000 },
    { employeeId: 'E002', employeeName: 'Sarah Williams', basePay: 11000000, overtime: 800000, bonus: 400000, deductions: 2200000, tax: 1300000, netPay: 8700000 },
    { employeeId: 'E003', employeeName: 'David Rodriguez', basePay: 10500000, overtime: 1200000, bonus: 300000, deductions: 2100000, tax: 1200000, netPay: 8700000 },
  ],
}

// Mock employee details per site per month
const mockSiteEmployeeDetails: Record<string, Record<string, DetailedRecord[]>> = {
  '1': {
    'S1': [
      { employeeId: 'E001', employeeName: 'Michael Chen', basePay: 12000000, overtime: 1500000, bonus: 500000, deductions: 2500000, tax: 1500000, netPay: 10000000 },
      { employeeId: 'E002', employeeName: 'Sarah Williams', basePay: 11000000, overtime: 800000, bonus: 400000, deductions: 2200000, tax: 1300000, netPay: 8700000 },
      { employeeId: 'E003', employeeName: 'David Rodriguez', basePay: 10500000, overtime: 1200000, bonus: 300000, deductions: 2100000, tax: 1200000, netPay: 8700000 },
      { employeeId: 'E004', employeeName: 'Emily Johnson', basePay: 9800000, overtime: 0, bonus: 200000, deductions: 1800000, tax: 1000000, netPay: 7200000 },
      { employeeId: 'E005', employeeName: 'James Wilson', basePay: 10200000, overtime: 1200000, bonus: 350000, deductions: 2000000, tax: 1200000, netPay: 8550000 },
      { employeeId: 'E006', employeeName: 'Robert Taylor', basePay: 9500000, overtime: 0, bonus: 150000, deductions: 1700000, tax: 950000, netPay: 7000000 },
      { employeeId: 'E007', employeeName: 'Anna Martinez', basePay: 10000000, overtime: 900000, bonus: 300000, deductions: 1900000, tax: 1100000, netPay: 8200000 },
      { employeeId: 'E008', employeeName: 'Chris Anderson', basePay: 11500000, overtime: 1600000, bonus: 450000, deductions: 2300000, tax: 1400000, netPay: 9750000 },
      { employeeId: 'E009', employeeName: 'Diana Lee', basePay: 10300000, overtime: 700000, bonus: 250000, deductions: 2000000, tax: 1200000, netPay: 8350000 },
      { employeeId: 'E010', employeeName: 'Edward Brown', basePay: 12500000, overtime: 1800000, bonus: 550000, deductions: 2600000, tax: 1600000, netPay: 10650000 },
      { employeeId: 'E011', employeeName: 'Fiona Davis', basePay: 9700000, overtime: 500000, bonus: 200000, deductions: 1800000, tax: 950000, netPay: 7650000 },
      { employeeId: 'E012', employeeName: 'George Wilson', basePay: 10800000, overtime: 1100000, bonus: 400000, deductions: 2100000, tax: 1300000, netPay: 8900000 },
      { employeeId: 'E013', employeeName: 'Helena Garcia', basePay: 11200000, overtime: 1400000, bonus: 380000, deductions: 2200000, tax: 1350000, netPay: 9430000 },
      { employeeId: 'E014', employeeName: 'Ivan Rodriguez', basePay: 10100000, overtime: 800000, bonus: 300000, deductions: 1950000, tax: 1150000, netPay: 8300000 },
      { employeeId: 'E015', employeeName: 'Julia Martinez', basePay: 9900000, overtime: 600000, bonus: 250000, deductions: 1850000, tax: 1050000, netPay: 7850000 },
      { employeeId: 'E016', employeeName: 'Kevin Thompson', basePay: 11800000, overtime: 1700000, bonus: 500000, deductions: 2400000, tax: 1500000, netPay: 10100000 },
      { employeeId: 'E017', employeeName: 'Laura Johnson', basePay: 10400000, overtime: 900000, bonus: 320000, deductions: 2050000, tax: 1250000, netPay: 8370000 },
      { employeeId: 'E018', employeeName: 'Michael Peters', basePay: 12100000, overtime: 1500000, bonus: 480000, deductions: 2400000, tax: 1500000, netPay: 10180000 },
    ],
    'S2': [
      { employeeId: 'E019', employeeName: 'Nina Williamson', basePay: 10600000, overtime: 1000000, bonus: 350000, deductions: 2050000, tax: 1250000, netPay: 8650000 },
      { employeeId: 'E020', employeeName: 'Oscar Brown', basePay: 11000000, overtime: 1200000, bonus: 400000, deductions: 2150000, tax: 1300000, netPay: 9150000 },
      { employeeId: 'E021', employeeName: 'Patricia Davis', basePay: 10200000, overtime: 800000, bonus: 300000, deductions: 1950000, tax: 1150000, netPay: 8300000 },
      { employeeId: 'E022', employeeName: 'Quincy Miller', basePay: 9800000, overtime: 700000, bonus: 250000, deductions: 1850000, tax: 1050000, netPay: 7950000 },
      { employeeId: 'E023', employeeName: 'Rachel White', basePay: 11300000, overtime: 1300000, bonus: 420000, deductions: 2200000, tax: 1350000, netPay: 9470000 },
      { employeeId: 'E024', employeeName: 'Samuel Harris', basePay: 10500000, overtime: 900000, bonus: 330000, deductions: 2000000, tax: 1200000, netPay: 8530000 },
      { employeeId: 'E025', employeeName: 'Tanya Martin', basePay: 10100000, overtime: 800000, bonus: 310000, deductions: 1950000, tax: 1150000, netPay: 8310000 },
      { employeeId: 'E026', employeeName: 'Ulrich Taylor', basePay: 11600000, overtime: 1400000, bonus: 450000, deductions: 2250000, tax: 1400000, netPay: 9800000 },
      { employeeId: 'E027', employeeName: 'Victoria Anderson', basePay: 10300000, overtime: 850000, bonus: 320000, deductions: 2000000, tax: 1200000, netPay: 8470000 },
      { employeeId: 'E028', employeeName: 'William Thomas', basePay: 12000000, overtime: 1500000, bonus: 470000, deductions: 2350000, tax: 1450000, netPay: 10170000 },
      { employeeId: 'E029', employeeName: 'Xena Jackson', basePay: 10000000, overtime: 700000, bonus: 300000, deductions: 1900000, tax: 1100000, netPay: 8300000 },
      { employeeId: 'E030', employeeName: 'Yuri Lee', basePay: 10700000, overtime: 1000000, bonus: 360000, deductions: 2070000, tax: 1270000, netPay: 8790000 },
      { employeeId: 'E031', employeeName: 'Zara Smith', basePay: 10400000, overtime: 900000, bonus: 340000, deductions: 2020000, tax: 1220000, netPay: 8520000 },
      { employeeId: 'E032', employeeName: 'Aaron Green', basePay: 11200000, overtime: 1200000, bonus: 400000, deductions: 2150000, tax: 1300000, netPay: 9350000 },
      { employeeId: 'E033', employeeName: 'Bella King', basePay: 10300000, overtime: 850000, bonus: 330000, deductions: 2000000, tax: 1200000, netPay: 8480000 },
    ],
    'S3': [
      { employeeId: 'E034', employeeName: 'Carlos Wright', basePay: 10500000, overtime: 950000, bonus: 340000, deductions: 2020000, tax: 1220000, netPay: 8560000 },
      { employeeId: 'E035', employeeName: 'Diana Turner', basePay: 10100000, overtime: 800000, bonus: 310000, deductions: 1950000, tax: 1150000, netPay: 8310000 },
      { employeeId: 'E036', employeeName: 'Ethan Scott', basePay: 11400000, overtime: 1300000, bonus: 430000, deductions: 2200000, tax: 1350000, netPay: 9580000 },
      { employeeId: 'E037', employeeName: 'Fiona Green', basePay: 10200000, overtime: 850000, bonus: 320000, deductions: 1980000, tax: 1180000, netPay: 8390000 },
      { employeeId: 'E038', employeeName: 'George Hill', basePay: 10600000, overtime: 1000000, bonus: 350000, deductions: 2050000, tax: 1250000, netPay: 8650000 },
      { employeeId: 'E039', employeeName: 'Helena Adams', basePay: 11000000, overtime: 1150000, bonus: 390000, deductions: 2120000, tax: 1300000, netPay: 9130000 },
      { employeeId: 'E040', employeeName: 'Isaac Nelson', basePay: 10300000, overtime: 900000, bonus: 330000, deductions: 2000000, tax: 1200000, netPay: 8430000 },
      { employeeId: 'E041', employeeName: 'Julia Carter', basePay: 10800000, overtime: 1050000, bonus: 370000, deductions: 2080000, tax: 1280000, netPay: 8940000 },
      { employeeId: 'E042', employeeName: 'Kevin Mitchell', basePay: 10400000, overtime: 900000, bonus: 340000, deductions: 2020000, tax: 1220000, netPay: 8520000 },
      { employeeId: 'E043', employeeName: 'Laura Perez', basePay: 11100000, overtime: 1200000, bonus: 400000, deductions: 2150000, tax: 1300000, netPay: 9250000 },
      { employeeId: 'E044', employeeName: 'Michael Roberts', basePay: 10500000, overtime: 950000, bonus: 345000, deductions: 2030000, tax: 1230000, netPay: 8580000 },
      { employeeId: 'E045', employeeName: 'Nancy Phillips', basePay: 10700000, overtime: 1050000, bonus: 365000, deductions: 2070000, tax: 1270000, netPay: 8780000 },
    ],
  },
}

export default function MonthlyRecapPage() {
  const [loading, setLoading] = useState(false)
  const [expandedMonths, setExpandedMonths] = useState<string[]>(['1'])
  const [selectedRecord, setSelectedRecord] = useState<MonthlyRecord | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailedRecords, setDetailedRecords] = useState<DetailedRecord[]>([])
  const [selectedSite, setSelectedSite] = useState<SiteDetail | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<MonthlyRecord | null>(null)
  const [siteDetailsOpen, setSiteDetailsOpen] = useState(false)
  const [siteLoading, setSiteLoading] = useState(false)
  const [siteEmployees, setSiteEmployees] = useState<DetailedRecord[]>([])

  const latestRecord = mockMonthlyRecords[0]
  const previousRecord = mockMonthlyRecords[1]
  
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

  const toggleMonth = (monthId: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthId) 
        ? prev.filter(id => id !== monthId)
        : [...prev, monthId]
    )
  }

  const handleViewDetails = (record: MonthlyRecord) => {
    setSelectedRecord(record)
    setDetailsOpen(true)
  }

  const handleSiteClick = (site: SiteDetail, month: MonthlyRecord) => {
    setSelectedSite(site)
    setSelectedMonth(month)
    setSiteLoading(true)
    setTimeout(() => {
      const employees = mockSiteEmployeeDetails[month.id]?.[site.siteId] || []
      setSiteEmployees(employees)
      setSiteLoading(false)
    }, 500)
    setSiteDetailsOpen(true)
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

      {/* Monthly History with Expandable Details */}
      <div className="space-y-3">
        {mockMonthlyRecords.map((record) => {
          const isExpanded = expandedMonths.includes(record.id)
          
          return (
            <Card key={record.id}>
              <CardHeader>
                <button
                  onClick={() => toggleMonth(record.id)}
                  className="w-full flex items-center justify-between hover:bg-muted/50 p-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-5 text-muted-foreground" />
                    )}
                    <div className="text-left flex-1">
                      <CardTitle className="text-base">{record.month}</CardTitle>
                      <CardDescription className="text-xs">
                        {record.totalEmployees} employees • {formatCurrency(record.totalPayroll)} total payroll
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusStyles[record.status]}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </button>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  {/* Month Summary Stats */}
                  <div className="grid gap-3 md:grid-cols-4 bg-muted/30 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Payroll</p>
                      <p className="text-lg font-semibold">{formatCurrency(record.totalPayroll)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bonus</p>
                      <p className="text-lg font-semibold text-success">{formatCurrency(record.totalBonus)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deductions</p>
                      <p className="text-lg font-semibold text-destructive">{formatCurrency(record.totalDeductions)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Payroll</p>
                      <p className="text-lg font-semibold text-success">{formatCurrency(record.netPayroll)}</p>
                    </div>
                  </div>

                  {/* Site Details Table */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Payroll by Site</h4>
                    <div className="rounded-lg border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Site</TableHead>
                            <TableHead className="text-right">Location</TableHead>
                            <TableHead className="text-right">Employees</TableHead>
                            <TableHead className="text-right">Payroll</TableHead>
                            <TableHead className="text-right">Bonus</TableHead>
                            <TableHead className="text-right">Deductions</TableHead>
                            <TableHead className="text-right">Net Payroll</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {record.sites?.map((site) => (
                            <TableRow 
                              key={site.siteId}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleSiteClick(site, record)}
                            >
                              <TableCell className="font-medium text-sm">{site.siteName}</TableCell>
                              <TableCell className="text-right text-sm">{site.location}</TableCell>
                              <TableCell className="text-right text-sm">{site.employees}</TableCell>
                              <TableCell className="text-right text-sm">{formatCurrency(site.payroll)}</TableCell>
                              <TableCell className="text-right text-sm text-success">{formatCurrency(site.bonus)}</TableCell>
                              <TableCell className="text-right text-sm text-destructive">{formatCurrency(site.deductions)}</TableCell>
                              <TableCell className="text-right text-sm font-medium text-success">{formatCurrency(site.netPayroll)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground">Last updated: {record.lastUpdated}</div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

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

              <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
                Last calculated: {selectedRecord.lastUpdated}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Site Employee Details Dialog */}
      <Dialog open={siteDetailsOpen} onOpenChange={setSiteDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Site Payroll Details</DialogTitle>
            <DialogDescription>
              {selectedMonth?.month} • {selectedSite?.siteName} ({selectedSite?.location})
            </DialogDescription>
          </DialogHeader>

          {selectedSite && selectedMonth && (
            <div className="space-y-6">
              {/* Site Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Payroll</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(selectedSite.payroll)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Bonus</p>
                  <p className="text-2xl font-bold text-success mt-2">{formatCurrency(selectedSite.bonus)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Deductions</p>
                  <p className="text-2xl font-bold text-destructive mt-2">{formatCurrency(selectedSite.deductions)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Payroll</p>
                  <p className="text-2xl font-bold text-success mt-2">{formatCurrency(selectedSite.netPayroll)}</p>
                </div>
              </div>

              {/* Employee Details Table */}
              <div>
                <h3 className="font-semibold mb-4">Employee Payroll Details ({selectedSite.employees} employees)</h3>
                {siteLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Days</TableHead>
                          <TableHead className="text-right">Base Pay</TableHead>
                          <TableHead className="text-right">OT Hours</TableHead>
                          <TableHead className="text-right">OT Amount</TableHead>
                          <TableHead className="text-right">Bonus</TableHead>
                          <TableHead className="text-right">Deductions</TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                          <TableHead className="text-right">Net Pay</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {siteEmployees.map((employee, idx) => (
                          <TableRow key={employee.employeeId}>
                            <TableCell className="font-medium text-sm">{employee.employeeName}</TableCell>
                            <TableCell className="text-right text-sm">22/22</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(employee.basePay)}</TableCell>
                            <TableCell className="text-right text-sm text-success">{(employee.overtime / 100000).toFixed(1)}h</TableCell>
                            <TableCell className="text-right text-sm text-success">{formatCurrency(employee.overtime)}</TableCell>
                            <TableCell className="text-right text-sm text-success">{formatCurrency(employee.bonus)}</TableCell>
                            <TableCell className="text-right text-sm text-destructive">{formatCurrency(employee.deductions)}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(employee.tax)}</TableCell>
                            <TableCell className="text-right text-sm font-medium text-success">{formatCurrency(employee.netPay)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
