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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Check,
  Lock,
  Loader2,
  Plus,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SiteEmployee {
  employeeId: string
  name: string
  position: string
  baseSalary: number
  overtime: number
  bonus: number
  deductions: number
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
    { employeeId: 'E001', name: 'Michael Chen', position: 'Security Head', baseSalary: 12000000, overtime: 1500000, bonus: 500000, deductions: 2500000, netPay: 10000000, status: 'draft' },
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [lockOpen, setLockOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEditEmployee = (employee: SiteEmployee) => {
    setEditingEmployee(employee)
    setEditOpen(true)
  }

  const handleSaveEmployee = () => {
    if (!editingEmployee) return
    setEmployees(prev => prev.map(e => e.employeeId === editingEmployee.employeeId ? editingEmployee : e))
    setEditOpen(false)
    setEditingEmployee(null)
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{siteInfo.employees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gross Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(siteInfo.grossPayroll)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(siteInfo.bonusAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(siteInfo.deductionsAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(siteInfo.netPayroll)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="finalize">Finalize & Lock</TabsTrigger>
        </TabsList>

        {/* Employee Payroll Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Details</CardTitle>
              <CardDescription>Edit individual employee payroll for {siteInfo.siteName}</CardDescription>
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
                      <TableHead className="text-right">Bonus</TableHead>
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

      {/* Edit Employee Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee Payroll</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="space-y-4">
              <div>
                <Label>Employee</Label>
                <Input value={editingEmployee.name} disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Base Salary</Label>
                  <Input
                    type="number"
                    value={editingEmployee.baseSalary}
                    onChange={(e) => setEditingEmployee({
                      ...editingEmployee,
                      baseSalary: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Overtime</Label>
                  <Input
                    type="number"
                    value={editingEmployee.overtime}
                    onChange={(e) => setEditingEmployee({
                      ...editingEmployee,
                      overtime: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Bonus</Label>
                  <Input
                    type="number"
                    value={editingEmployee.bonus}
                    onChange={(e) => setEditingEmployee({
                      ...editingEmployee,
                      bonus: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Deductions</Label>
                  <Input
                    type="number"
                    value={editingEmployee.deductions}
                    onChange={(e) => setEditingEmployee({
                      ...editingEmployee,
                      deductions: Number(e.target.value)
                    })}
                  />
                </div>
              </div>
              <div className="bg-slate-100 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Calculated Net Pay</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(editingEmployee.baseSalary + editingEmployee.overtime + editingEmployee.bonus - editingEmployee.deductions)}
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEmployee}>Save Changes</Button>
              </div>
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
    </div>
  )
}
