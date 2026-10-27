'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  MapPin,
  Edit,
  Trash2,
  Check,
  Lock,
  Loader2,
  Plus,
  AlertCircle,
  Calendar,
  Upload,
  ChevronRight,
  Clock3,
  ReceiptText,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SiteEmployee {
  employeeId: string
  name: string
  position: string
  baseSalary: number
  overtime: number
  overtimeHours?: number
  overtimeRule?: string
  bonus: number
  allowanceSource?: string
  deductions: number
  deductionSource?: string
  netPay: number
  status: 'draft' | 'processing' | 'finalized'
}

interface SitePayrollAdjustment {
  id: string
  employee: string
  type: 'overtime' | 'bonus' | 'deduction'
  amount: number
  reason: string
  date: string
}

// Mock site details
const mockSiteDetails = {
  'S1': {
    siteName: 'Head Office',
    location: 'Jakarta',
    employees: 18,
    grossPayroll: 245000000,
    bonusAmount: 12000000,
    deductionsAmount: 55000000,
    netPayroll: 190000000,
    status: 'draft',
  },
  'S2': {
    siteName: 'Regional Office',
    location: 'Surabaya',
    employees: 15,
    grossPayroll: 185000000,
    bonusAmount: 9000000,
    deductionsAmount: 42000000,
    netPayroll: 143000000,
    status: 'draft',
  },
  'S3': {
    siteName: 'Branch Office',
    location: 'Bandung',
    employees: 12,
    grossPayroll: 112890000,
    bonusAmount: 7000000,
    deductionsAmount: 28000000,
    netPayroll: 84890000,
    status: 'draft',
  },
}

// Mock employees by site
const mockSiteEmployees: Record<string, SiteEmployee[]> = {
  'S1': [
    { employeeId: 'E001', name: 'Michael Chen', position: 'Security Head', baseSalary: 12000000, overtime: 1500000, overtimeHours: 5, overtimeRule: 'Fixed OT rate · Rp 300.000/hour', bonus: 500000, allowanceSource: 'Attendance allowance · 5 qualifying days', deductions: 2500000, deductionSource: 'BPJS and loan deduction rules', netPay: 10000000, status: 'draft' },
    { employeeId: 'E002', name: 'Sarah Williams', position: 'Guard', baseSalary: 11000000, overtime: 800000, bonus: 400000, deductions: 2200000, netPay: 8700000, status: 'draft' },
    { employeeId: 'E003', name: 'David Rodriguez', position: 'Guard', baseSalary: 10500000, overtime: 1200000, bonus: 300000, deductions: 2100000, netPay: 8700000, status: 'draft' },
    { employeeId: 'E004', name: 'Emily Johnson', position: 'Guard', baseSalary: 9800000, overtime: 0, bonus: 200000, deductions: 1800000, netPay: 7200000, status: 'draft' },
    { employeeId: 'E005', name: 'James Wilson', position: 'Guard', baseSalary: 10200000, overtime: 1200000, bonus: 350000, deductions: 2000000, netPay: 8550000, status: 'draft' },
    { employeeId: 'E006', name: 'Robert Taylor', position: 'Guard', baseSalary: 9500000, overtime: 0, bonus: 150000, deductions: 1700000, netPay: 7000000, status: 'draft' },
    { employeeId: 'E007', name: 'Anna Martinez', position: 'Supervisor', baseSalary: 10000000, overtime: 900000, bonus: 300000, deductions: 1900000, netPay: 8200000, status: 'draft' },
    { employeeId: 'E008', name: 'Chris Anderson', position: 'Guard', baseSalary: 11500000, overtime: 1600000, bonus: 450000, deductions: 2300000, netPay: 9750000, status: 'draft' },
  ],
  'S2': [
    { employeeId: 'E019', name: 'Nina Williamson', position: 'Regional Manager', baseSalary: 10600000, overtime: 1000000, bonus: 350000, deductions: 2050000, netPay: 8650000, status: 'draft' },
    { employeeId: 'E020', name: 'Oscar Brown', position: 'Guard', baseSalary: 11000000, overtime: 1200000, bonus: 400000, deductions: 2150000, netPay: 9150000, status: 'draft' },
    { employeeId: 'E021', name: 'Patricia Davis', position: 'Guard', baseSalary: 10200000, overtime: 800000, bonus: 300000, deductions: 1950000, netPay: 8300000, status: 'draft' },
    { employeeId: 'E022', name: 'Quincy Miller', position: 'Guard', baseSalary: 9800000, overtime: 700000, bonus: 250000, deductions: 1850000, netPay: 7950000, status: 'draft' },
    { employeeId: 'E023', name: 'Rachel White', position: 'Supervisor', baseSalary: 11300000, overtime: 1300000, bonus: 420000, deductions: 2200000, netPay: 9470000, status: 'draft' },
  ],
  'S3': [
    { employeeId: 'E034', name: 'Carlos Wright', position: 'Branch Manager', baseSalary: 10500000, overtime: 950000, bonus: 340000, deductions: 2020000, netPay: 8560000, status: 'draft' },
    { employeeId: 'E035', name: 'Diana Turner', position: 'Guard', baseSalary: 10100000, overtime: 800000, bonus: 310000, deductions: 1950000, netPay: 8310000, status: 'draft' },
    { employeeId: 'E036', name: 'Ethan Scott', position: 'Guard', baseSalary: 11400000, overtime: 1300000, bonus: 430000, deductions: 2200000, netPay: 9580000, status: 'draft' },
  ],
}

// Mock adjustments by site
const mockAdjustments: Record<string, SitePayrollAdjustment[]> = {
  'S1': [
    { id: 'adj1', employee: 'Michael Chen', type: 'overtime', amount: 1500000, reason: 'Fixed OT - 5 hours', date: '2026-03-31' },
    { id: 'adj2', employee: 'Sarah Williams', type: 'bonus', amount: 2000000, reason: 'Performance Bonus', date: '2026-03-30' },
    { id: 'adj3', employee: 'David Rodriguez', type: 'overtime', amount: 2500000, reason: 'National Holiday OT - 8 hours', date: '2026-03-29' },
  ],
  'S2': [
    { id: 'adj5', employee: 'Nina Williamson', type: 'overtime', amount: 1200000, reason: 'Fixed OT - 4 hours', date: '2026-03-31' },
    { id: 'adj6', employee: 'Oscar Brown', type: 'bonus', amount: 1500000, reason: 'Attendance Bonus', date: '2026-03-30' },
  ],
  'S3': [
    { id: 'adj8', employee: 'Carlos Wright', type: 'overtime', amount: 950000, reason: 'Fixed OT - 3 hours', date: '2026-03-31' },
  ],
}

export default function SiteManagementPage() {
  const router = useRouter()
  const params = useParams()
  const siteId = params.siteId as string
  
  const siteInfo = mockSiteDetails[siteId as keyof typeof mockSiteDetails]
  const siteEmployees = mockSiteEmployees[siteId as keyof typeof mockSiteEmployees] || []
  const adjustments = mockAdjustments[siteId as keyof typeof mockAdjustments] || []
  
  const [employees, setEmployees] = useState<SiteEmployee[]>(siteEmployees)
  const [editingEmployee, setEditingEmployee] = useState<SiteEmployee | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [payrollDetail, setPayrollDetail] = useState<'overtime' | 'deductions' | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [lockOpen, setLockOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  const handleEditEmployee = (employee: SiteEmployee) => {
    setEditingEmployee(employee)
    setPayrollDetail(null)
    setEditOpen(true)
  }


  const handleDeleteAdjustment = (adjId: string) => {
    setDeleteTarget(adjId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // Mock delete
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const handleLockPayroll = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setLockOpen(false)
    }, 1000)
  }

  const handleImportTimesheet = async () => {
    if (!importFile) {
      setImportMessage('Please select a file to import')
      return
    }

    setImportLoading(true)
    setImportMessage('Processing timesheet...')

    // Simulate file processing
    setTimeout(() => {
      try {
        // Mock timesheet parsing
        const mockTimesheetData = [
          { employeeId: 'E001', dutyDays: 22, overtime: 15, bonus: 500000 },
          { employeeId: 'E002', dutyDays: 21, overtime: 8, bonus: 400000 },
          { employeeId: 'E003', dutyDays: 22, overtime: 12, bonus: 300000 },
        ]

        // Update employees based on timesheet
        setEmployees(prev => prev.map(emp => {
          const timesheetRecord = mockTimesheetData.find(t => t.employeeId === emp.employeeId)
          if (timesheetRecord) {
            const overtimeAmount = (emp.baseSalary / 22) * (timesheetRecord.overtime / 8) * 1.5
            return {
              ...emp,
              overtime: overtimeAmount,
              bonus: timesheetRecord.bonus,
              netPay: emp.baseSalary + overtimeAmount + timesheetRecord.bonus - emp.deductions,
            }
          }
          return emp
        }))

        setImportMessage('Timesheet imported successfully! Payroll has been calculated.')
        setImportFile(null)
        setImportLoading(false)
        setTimeout(() => {
          setImportOpen(false)
          setImportMessage('')
        }, 2000)
      } catch (error) {
        setImportMessage('Error processing timesheet. Please check the file format.')
        setImportLoading(false)
      }
    }, 1500)
  }

  if (!siteInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="pt-6">
            <p>Site not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{siteInfo.siteName} - Payroll Management</h1>
          <p className="text-muted-foreground">
            March 2026 • {siteInfo.location}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Site Summary</TabsTrigger>
          <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="validation">Issues & Validation</TabsTrigger>
          <TabsTrigger value="finalize">Finalize & Lock</TabsTrigger>
        </TabsList>

        {/* Site Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{siteInfo.siteName} Payroll Summary</CardTitle>
              <CardDescription>
                Read-only overview for {siteInfo.location} during the {`March 2026`} payroll period.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Gross Payroll</p>
                <p className="mt-2 text-xl font-bold tabular-nums">{formatCurrency(siteInfo.grossPayroll)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Allowance</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-success">{formatCurrency(siteInfo.bonusAmount)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Deductions</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-destructive">{formatCurrency(siteInfo.deductionsAmount)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Net Payroll</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-success">{formatCurrency(siteInfo.netPayroll)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Payroll status</p>
                <Badge variant="outline" className="mt-2 bg-slate-100 text-slate-700">{siteInfo.status.charAt(0).toUpperCase() + siteInfo.status.slice(1)}</Badge>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="mt-2 font-medium">March 31, 2026 at 2:30 PM</p>
              </div>
              <div className="rounded-lg border p-4 md:col-span-2">
                <p className="text-sm text-muted-foreground">Payroll formula</p>
                <p className="mt-2 font-medium">Gross payroll + bonuses − deductions = net payroll</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Issues & Validation
              </CardTitle>
              <CardDescription>Resolve these items before finalizing {siteInfo.siteName} payroll.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Validation checks are shown here for this site only. Payroll cannot be safely finalized until blocking issues are resolved.
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Missing attendance records</p>
                <p className="mt-1 text-sm text-muted-foreground">Review attendance and timesheet data for 2 employees.</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Budget review</p>
                <p className="mt-1 text-sm text-muted-foreground">Confirm the Field Security budget variance before locking.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Payroll Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employee Payroll Details</CardTitle>
                <CardDescription>Edit individual employee payroll for {siteInfo.siteName}</CardDescription>
              </div>
              <Button
                onClick={() => setImportOpen(true)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Timesheet
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-right">Base Salary</TableHead>
                      <TableHead className="text-right">Overtime</TableHead>
                      <TableHead className="text-right">Allowance</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.employeeId}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell className="text-sm">{employee.position}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(employee.baseSalary)}</TableCell>
                        <TableCell className="text-right text-sm text-success">{formatCurrency(employee.overtime)}</TableCell>
                        <TableCell className="text-right text-sm text-success">{formatCurrency(employee.bonus)}</TableCell>
                        <TableCell className="text-right text-sm text-destructive">{formatCurrency(employee.deductions)}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-success">{formatCurrency(employee.netPay)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-100 text-slate-700">
                            Draft
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Payroll Adjustments</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Adjustment
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {adjustments.length === 0 ? (
                <p className="text-muted-foreground">No adjustments for this site.</p>
              ) : (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adjustments.map((adj) => (
                        <TableRow key={adj.id}>
                          <TableCell className="font-medium">{adj.employee}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              adj.type === 'overtime' ? 'bg-blue-100 text-blue-700' :
                              adj.type === 'bonus' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {adj.type.charAt(0).toUpperCase() + adj.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{adj.reason}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(adj.amount)}</TableCell>
                          <TableCell>{adj.date}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAdjustment(adj.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finalize & Lock Tab */}
        <TabsContent value="finalize" className="space-y-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Lock Payroll for {siteInfo.siteName}
              </CardTitle>
              <CardDescription>
                Once locked, this site&apos;s payroll will be finalized and no further edits will be allowed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2 border">
                <p className="text-sm font-medium">Payroll Summary</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Gross Payroll: </span>
                    <span className="font-medium">{formatCurrency(siteInfo.grossPayroll)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Net Payroll: </span>
                    <span className="font-medium">{formatCurrency(siteInfo.netPayroll)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bonus: </span>
                    <span className="font-medium text-success">{formatCurrency(siteInfo.bonusAmount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deductions: </span>
                    <span className="font-medium text-destructive">{formatCurrency(siteInfo.deductionsAmount)}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setLockOpen(true)}
                className="w-full"
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock and Finalize Payroll
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Payroll Details Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-none gap-0 overflow-hidden p-0 sm:w-[calc(100vw-4rem)] sm:max-w-[1600px] lg:w-[calc(100vw-8rem)]">
          <DialogHeader className="border-b px-5 py-3">
            {payrollDetail ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" aria-label="Back to payroll overview" onClick={() => setPayrollDetail(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>{payrollDetail === 'overtime' ? 'Overtime Calculation' : 'Deduction Calculation'}</DialogTitle>
                  <DialogDescription>Detailed read-only breakdown for {editingEmployee?.name}.</DialogDescription>
                </div>
              </div>
            ) : (
              <>
                <DialogTitle>Employee Payroll Details</DialogTitle>
                <DialogDescription>Read-only calculation breakdown for the {`March 2026`} payroll period.</DialogDescription>
              </>
            )}
          </DialogHeader>
          {editingEmployee && (
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto px-5 py-3">
              {payrollDetail ? (
                <div className="space-y-2">
                  <div className="rounded-lg border bg-muted/30 p-5">
                    <p className="text-sm text-muted-foreground">{payrollDetail === 'overtime' ? 'Calculated overtime' : 'Calculated deductions'}</p>
                    <p className={`mt-2 text-3xl font-bold tabular-nums ${payrollDetail === 'overtime' ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(payrollDetail === 'overtime' ? editingEmployee.overtime : editingEmployee.deductions)}
                    </p>
                  </div>
                  {payrollDetail === 'overtime' ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">Overtime days</p><p className="mt-1 text-xl font-semibold">2 days</p></div>
                        <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">Total hours</p><p className="mt-1 text-xl font-semibold">{editingEmployee.overtimeHours || 0} hours</p></div>
                        <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">Hours per day</p><p className="mt-1 text-xl font-semibold">2.5 hours</p></div>
                        <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">Rate per hour</p><p className="mt-1 text-xl font-semibold tabular-nums">Rp 300.000</p></div>
                      </div>
                      <div className="rounded-lg border p-4 text-sm">
                        <div className="flex items-center justify-between gap-4"><h3 className="font-semibold">Daily overtime breakdown</h3><span className="text-xs text-muted-foreground">Mockup data</span></div>
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full min-w-[520px] text-left">
                            <thead className="border-b text-xs text-muted-foreground"><tr><th className="pb-2 font-medium">Date · day type</th><th className="pb-2 font-medium">Hour tier</th><th className="pb-2 font-medium">Multiplier</th><th className="pb-2 font-medium">Base rate</th><th className="pb-2 text-right font-medium">Amount</th></tr></thead>
                            <tbody className="divide-y"><tr><td className="py-3"><span className="block">March 14, 2026</span><span className="text-xs text-muted-foreground">Regular workday</span></td><td className="py-3">1st hour</td><td className="py-3 font-medium">1.5×</td><td className="py-3 tabular-nums">Rp 300.000</td><td className="py-3 text-right font-medium tabular-nums">Rp 450.000</td></tr><tr><td className="py-3"><span className="block">March 14, 2026</span><span className="text-xs text-muted-foreground">Regular workday</span></td><td className="py-3">2nd–3rd hour</td><td className="py-3 font-medium">2.0×</td><td className="py-3 tabular-nums">Rp 300.000</td><td className="py-3 text-right font-medium tabular-nums">Rp 600.000</td></tr><tr className="bg-amber-500/5"><td className="py-3"><span className="block">March 21, 2026</span><span className="text-xs text-muted-foreground">National holiday</span></td><td className="py-3">1st hour</td><td className="py-3 font-medium text-amber-600">2.0×</td><td className="py-3 tabular-nums">Rp 300.000</td><td className="py-3 text-right font-medium tabular-nums">Rp 600.000</td></tr><tr className="bg-amber-500/5"><td className="py-3"><span className="block">March 21, 2026</span><span className="text-xs text-muted-foreground">National holiday</span></td><td className="py-3">2nd hour</td><td className="py-3 font-medium text-amber-600">2.5×</td><td className="py-3 tabular-nums">Rp 300.000</td><td className="py-3 text-right font-medium tabular-nums">Rp 750.000</td></tr></tbody>
                            <tfoot className="border-t"><tr><td colSpan={4} className="pt-3 font-semibold">Total calculated overtime</td><td className="pt-3 text-right font-bold text-success tabular-nums">Rp 2.400.000</td></tr></tfoot>
                          </table>
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 text-sm"><h3 className="font-semibold">Calculation source</h3><dl className="mt-3 grid gap-3 sm:grid-cols-2"><div><dt className="text-muted-foreground">Applied rule</dt><dd className="font-medium">{editingEmployee.overtimeRule || 'Fixed OT rate · Rp 300.000/hour'}</dd></div><div><dt className="text-muted-foreground">Exceptional changes</dt><dd className="font-medium">Adjustments tab</dd></div></dl></div>
                    </div>
                  ) : (
                    <div className="rounded-lg border p-4 text-sm">
                      <h3 className="font-semibold">Calculation source</h3>
                      <dl className="mt-3 space-y-3">
                        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Applied source</dt><dd className="text-right font-medium">{editingEmployee.deductionSource || 'Active deduction rules'}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Payroll period</dt><dd className="font-medium">March 2026</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Exceptional changes</dt><dd className="font-medium">Adjustments tab</dd></div>
                      </dl>
                    </div>
                  )}
                  <p className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">This value is calculated from payroll rules and approved records. It is read-only here; exceptional changes must be managed from the Adjustments tab.</p>
                  <div className="flex justify-end"><Button variant="outline" onClick={() => setPayrollDetail(null)}>Back to overview</Button></div>
                </div>
              ) : (
              <div className="space-y-2">
                <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
                <div className="rounded-xl border bg-muted/30 p-3 lg:col-span-3">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Employee payroll</p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight">{editingEmployee.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{editingEmployee.position} · {siteInfo.siteName}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payroll period</p>
                        <p className="mt-1 text-sm text-muted-foreground"><strong className="font-semibold text-foreground">March 2026</strong> · Read-only view</p>
                      </div>
                      <Badge variant="secondary">Draft</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Base salary</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(editingEmployee.baseSalary)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">From salary setup · read-only</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Calculated net pay</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-success">{formatCurrency(editingEmployee.baseSalary + editingEmployee.overtime + editingEmployee.bonus - editingEmployee.deductions)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Base salary + allowance + overtime − deductions</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <button type="button" className="group flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40" onClick={() => setPayrollDetail('overtime')}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"><Clock3 className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-medium">Overtime calculation</span><span className="mt-1 block text-sm text-muted-foreground">{editingEmployee.overtimeHours || 0} approved hours · View applied rule</span></span>
                <span className="flex items-center gap-2"><span className="font-semibold tabular-nums text-success">{formatCurrency(editingEmployee.overtime)}</span><ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></span>
              </button>

              <div className="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">+</span>
                <span className="min-w-0 flex-1"><span className="block font-medium">Allowance</span><span className="mt-1 block text-sm text-muted-foreground">{editingEmployee.allowanceSource || 'Eligible allowance records'}</span></span>
                <span className="font-semibold tabular-nums text-success">{formatCurrency(editingEmployee.bonus)}</span>
              </div>

              <button type="button" className="group flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-colors hover:border-destructive/40 hover:bg-muted/40" onClick={() => setPayrollDetail('deductions')}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><ReceiptText className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-medium">Deduction calculation</span><span className="mt-1 block text-sm text-muted-foreground">View applied rules and deductions</span></span>
                <span className="flex items-center gap-2"><span className="font-semibold tabular-nums text-destructive">{formatCurrency(editingEmployee.deductions)}</span><ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></span>
              </button>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
              </div>
            </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Adjustment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this adjustment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lock Payroll Dialog */}
      <AlertDialog open={lockOpen} onOpenChange={setLockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Lock Payroll</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to lock payroll for {siteInfo.siteName}. This will finalize all payroll data and prevent further edits. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLockPayroll} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? 'Locking...' : 'Confirm Lock'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Timesheet Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Timesheet</DialogTitle>
            <DialogDescription>
              Upload a timesheet file containing employee duty days and overtime hours. Allowance information is calculated separately from eligible allowance records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {/* File Upload Area */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="timesheet-file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="timesheet-file" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {importFile ? importFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground">CSV, XLSX, or XLS files supported</p>
                  </div>
                </div>
              </label>
            </div>

            {/* File Format Info */}
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-2">Expected file format:</p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Employee ID or Name</li>
                <li>Duty Days (working days)</li>
                <li>Overtime Hours</li>
                <li>Allowance eligibility reference (optional)</li>
              </ul>
            </div>

            {/* Message */}
            {importMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                importMessage.includes('Error') 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-success/10 text-success'
              }`}>
                {importMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setImportOpen(false)
                  setImportFile(null)
                  setImportMessage('')
                }}
                disabled={importLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportTimesheet}
                disabled={!importFile || importLoading}
              >
                {importLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
