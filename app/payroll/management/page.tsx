'use client'

import { useState } from 'react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Calendar,
  Check,
  Lock,
  Loader2,
  AlertCircle,
  Download,
  Users,
  DollarSign,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PayrollPeriod {
  id: string
  month: string
  cutoffStartDate: string
  cutoffEndDate: string
  status: 'draft' | 'processing' | 'approved' | 'finalized'
  totalEmployees: number
  totalAmount: number
  totalDeductions: number
  netAmount: number
  lastUpdated: string
  createdBy: string
  approvedBy?: string
  approvedDate?: string
}

interface PayrollValidationIssue {
  id: string
  severity: 'error' | 'warning'
  message: string
  affectedEmployees?: number
}

interface CutoffConfig {
  startDate: string
  endDate: string
  processingDeadline: string
  approvalDeadline: string
  autoFinalize: boolean
}

// Mock data - current payroll period
const currentPayrollPeriod: PayrollPeriod = {
  id: '2026-03',
  month: 'March 2026',
  cutoffStartDate: '2026-03-01',
  cutoffEndDate: '2026-03-31',
  status: 'draft',
  totalEmployees: 105,
  totalAmount: 1247890000,
  totalDeductions: 295000000,
  netAmount: 952890000,
  lastUpdated: '2026-03-31 14:30 PM',
  createdBy: 'Admin',
}

// Mock validation issues for current month
const mockValidationIssues: PayrollValidationIssue[] = [
  {
    id: 'v1',
    severity: 'error',
    message: 'Missing attendance records for 5 employees',
    affectedEmployees: 5,
  },
  {
    id: 'v2',
    severity: 'warning',
    message: 'Budget exceeded in Security department by 2.5%',
    affectedEmployees: 12,
  },
  {
    id: 'v3',
    severity: 'warning',
    message: '3 employees have unsigned contracts for overtime',
    affectedEmployees: 3,
  },
]

// Mock cut-off configuration
const mockCutoffConfig: CutoffConfig = {
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  processingDeadline: '2026-04-05',
  approvalDeadline: '2026-04-08',
  autoFinalize: false,
}

// Mock payroll adjustments
const mockPayrollAdjustments = [
  {
    id: 'adj1',
    employee: 'Michael Chen',
    department: 'Field Security',
    type: 'Overtime Adjustment',
    amount: 1500000,
    reason: 'Fixed OT - 5 hours',
    date: '2026-03-31',
  },
  {
    id: 'adj2',
    employee: 'Sarah Williams',
    department: 'Surveillance',
    type: 'Bonus',
    amount: 2000000,
    reason: 'Performance Bonus',
    date: '2026-03-30',
  },
  {
    id: 'adj3',
    employee: 'David Rodriguez',
    department: 'Patrol',
    type: 'Overtime Adjustment',
    amount: 2500000,
    reason: 'National Holiday OT - 8 hours',
    date: '2026-03-29',
  },
]

export default function PayrollManagementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod>(currentPayrollPeriod)
  const [loading, setLoading] = useState(false)
  const [lockOpen, setLockOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [approverName, setApproverName] = useState('')

  const statusStyles = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-amber-100 text-amber-700 border-amber-200',
    finalized: 'bg-green-100 text-green-700 border-green-200',
  }

  const severityStyles = {
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  }

  const handleLockPayroll = () => {
    setLoading(true)
    setTimeout(() => {
      selectedPeriod.status = 'processing'
      selectedPeriod.lastUpdated = new Date().toLocaleString()
      setLoading(false)
      setLockOpen(false)
    }, 1000)
  }

  const handleApprovePayroll = () => {
    setLoading(true)
    setTimeout(() => {
      selectedPeriod.status = 'finalized'
      selectedPeriod.approvedBy = approverName || 'Finance Manager'
      selectedPeriod.approvedDate = new Date().toLocaleString()
      selectedPeriod.lastUpdated = new Date().toLocaleString()
      setLoading(false)
      setApproveOpen(false)
      setApproverName('')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage current month payroll based on cut-off date
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="size-4 mr-2" />
          Export Payroll
        </Button>
      </div>

      {/* Current Period Overview */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{selectedPeriod.month}</CardTitle>
              <CardDescription className="mt-2">
                Cut-off Period: {new Date(selectedPeriod.cutoffStartDate).toLocaleDateString()} - {new Date(selectedPeriod.cutoffEndDate).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={statusStyles[selectedPeriod.status]}>
                {selectedPeriod.status.charAt(0).toUpperCase() + selectedPeriod.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="size-4" />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{selectedPeriod.totalEmployees}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="size-4" />
                  Gross Payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(selectedPeriod.totalAmount)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(selectedPeriod.totalDeductions)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Check className="size-4" />
                  Net Payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">{formatCurrency(selectedPeriod.netAmount)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Status and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last updated: {selectedPeriod.lastUpdated}</p>
              {selectedPeriod.approvedDate && (
                <p className="text-sm text-muted-foreground">Approved by: {selectedPeriod.approvedBy} on {selectedPeriod.approvedDate}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedPeriod.status === 'draft' && (
                <>
                  <Button variant="outline">Edit Payroll</Button>
                  <Button onClick={() => setLockOpen(true)}>
                    <Lock className="size-4 mr-2" />
                    Lock & Process
                  </Button>
                </>
              )}
              {selectedPeriod.status === 'processing' && (
                <Button onClick={() => setApproveOpen(true)}>
                  <Check className="size-4 mr-2" />
                  Approve & Finalize
                </Button>
              )}
              {selectedPeriod.status === 'finalized' && (
                <Badge variant="outline" className={statusStyles[selectedPeriod.status]}>
                  ✓ Payroll Finalized
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="adjustments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="adjustments">Payroll Adjustments</TabsTrigger>
          <TabsTrigger value="validation">Validation Issues</TabsTrigger>
          <TabsTrigger value="cutoff">Cut-off Configuration</TabsTrigger>
        </TabsList>

        {/* Payroll Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Month Adjustments</CardTitle>
              <CardDescription>
                All overtime, bonuses, and other payroll adjustments for March 2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayrollAdjustments.map((adj) => (
                      <TableRow key={adj.id}>
                        <TableCell className="font-medium text-sm">{adj.employee}</TableCell>
                        <TableCell className="text-sm">{adj.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {adj.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{adj.reason}</TableCell>
                        <TableCell className="text-right font-medium text-success">{formatCurrency(adj.amount)}</TableCell>
                        <TableCell className="text-sm">{new Date(adj.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Issues Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Issues</CardTitle>
              <CardDescription>
                Issues that need to be resolved before payroll can be finalized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockValidationIssues.length > 0 ? (
                mockValidationIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-lg border flex gap-3 items-start ${severityStyles[issue.severity]}`}
                  >
                    <div className="pt-0.5">
                      {issue.severity === 'error' ? (
                        <AlertCircle className="size-5" />
                      ) : (
                        <AlertTriangle className="size-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{issue.message}</p>
                      {issue.affectedEmployees && (
                        <p className="text-xs mt-1">Affects {issue.affectedEmployees} employee(s)</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Resolve
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Check className="size-8 text-success mx-auto mb-2" />
                  <p className="text-muted-foreground">No validation issues detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cut-off Configuration Tab */}
        <TabsContent value="cutoff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cut-off Period Configuration</CardTitle>
              <CardDescription>
                Current payroll period cut-off dates and processing deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cut-off Start Date</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">{new Date(mockCutoffConfig.startDate).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Payroll period begins</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cut-off End Date</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">{new Date(mockCutoffConfig.endDate).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Payroll period ends</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Processing Deadline</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">{new Date(mockCutoffConfig.processingDeadline).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last day to lock payroll</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Approval Deadline</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">{new Date(mockCutoffConfig.approvalDeadline).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last day to approve payroll</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-finalize Payroll</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mockCutoffConfig.autoFinalize ? 'Enabled' : 'Disabled'} - payroll will {mockCutoffConfig.autoFinalize ? 'automatically' : 'not automatically'} finalize after approval deadline
                    </p>
                  </div>
                  <Badge variant={mockCutoffConfig.autoFinalize ? 'default' : 'outline'}>
                    {mockCutoffConfig.autoFinalize ? 'ON' : 'OFF'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
