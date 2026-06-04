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
  Calendar,
  Check,
  Clock,
  Download,
  Eye,
  Lock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
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

interface PayrollDifference {
  employeeId: string
  employeeName: string
  department: string
  previousAmount: number
  currentAmount: number
  difference: number
  percentChange: number
}

interface PayrollValidationIssue {
  id: string
  severity: 'error' | 'warning'
  message: string
  affectedEmployees?: number
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
  lastUpdated: '2026-03-17 10:30 AM',
  createdBy: 'Admin User',
}

// Mock historical periods
const payrollPeriods: PayrollPeriod[] = [
  currentPayrollPeriod,
  {
    id: '2026-02',
    month: 'February 2026',
    cutoffStartDate: '2026-02-01',
    cutoffEndDate: '2026-02-28',
    status: 'finalized',
    totalEmployees: 103,
    totalAmount: 1203000000,
    totalDeductions: 285000000,
    netAmount: 918000000,
    lastUpdated: '2026-03-01 02:00 AM',
    createdBy: 'Admin User',
    approvedBy: 'Finance Manager',
    approvedDate: '2026-03-01 08:00 AM',
  },
  {
    id: '2026-01',
    month: 'January 2026',
    cutoffStartDate: '2026-01-01',
    cutoffEndDate: '2026-01-31',
    status: 'finalized',
    totalEmployees: 102,
    totalAmount: 1215000000,
    totalDeductions: 288000000,
    netAmount: 927000000,
    lastUpdated: '2026-02-01 02:00 AM',
    createdBy: 'Admin User',
    approvedBy: 'Finance Manager',
    approvedDate: '2026-02-01 08:00 AM',
  },
]

// Mock validation issues
const mockValidationIssues: PayrollValidationIssue[] = [
  {
    id: 'v1',
    severity: 'error',
    message: 'Missing attendance data for 3 employees',
    affectedEmployees: 3,
  },
  {
    id: 'v2',
    severity: 'warning',
    message: 'Overtime rates exceeding budget threshold for 5 employees',
    affectedEmployees: 5,
  },
  {
    id: 'v3',
    severity: 'warning',
    message: 'New employees without complete tax documentation',
    affectedEmployees: 2,
  },
]

// Mock payroll differences
const mockPayrollDifferences: PayrollDifference[] = [
  {
    employeeId: 'E001',
    employeeName: 'Michael Chen',
    department: 'Security',
    previousAmount: 542000000,
    currentAmount: 545000000,
    difference: 3000000,
    percentChange: 0.55,
  },
  {
    employeeId: 'E002',
    employeeName: 'Sarah Williams',
    department: 'Surveillance',
    previousAmount: 325000000,
    currentAmount: 328000000,
    difference: 3000000,
    percentChange: 0.92,
  },
  {
    employeeId: 'E024',
    employeeName: 'Robert Taylor',
    department: 'Patrol',
    previousAmount: 380000000,
    currentAmount: 375000000,
    difference: -5000000,
    percentChange: -1.32,
  },
]

export default function PayrollManagementPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod>(currentPayrollPeriod)
  const [editOpen, setEditOpen] = useState(false)
  const [lockOpen, setLockOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
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

  const handleViewDetails = () => {
    setDetailsLoading(true)
    setTimeout(() => {
      setDetailsLoading(false)
      setViewDetailsOpen(true)
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage and process monthly payroll with cut-off date control
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="size-4 mr-2" />
          Export Report
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
                  <Button variant="outline" onClick={() => setEditOpen(true)}>Edit Period</Button>
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
                <Button variant="outline" disabled>
                  <Check className="size-4 mr-2" />
                  Finalized
                </Button>
              )}
              <Button variant="outline" onClick={handleViewDetails}>
                <Eye className="size-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Issues and Alerts */}
      {mockValidationIssues.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="size-5" />
              Validation Issues ({mockValidationIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockValidationIssues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-3 p-3 bg-white rounded border border-amber-200">
                  <Badge variant="outline" className={severityStyles[issue.severity]} className="mt-1">
                    {issue.severity === 'error' ? 'Error' : 'Warning'}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue.message}</p>
                    {issue.affectedEmployees && (
                      <p className="text-xs text-muted-foreground mt-1">Affects {issue.affectedEmployees} employee(s)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="periods" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="periods">Payroll Periods</TabsTrigger>
          <TabsTrigger value="differences">Month-over-Month Comparison</TabsTrigger>
          <TabsTrigger value="cutoff">Cut-off Configuration</TabsTrigger>
        </TabsList>

        {/* Payroll Periods Tab */}
        <TabsContent value="periods">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Period History</CardTitle>
              <CardDescription>View and manage all payroll periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Cut-off Dates</TableHead>
                      <TableHead className="text-right">Employees</TableHead>
                      <TableHead className="text-right">Gross Amount</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollPeriods.map((period) => (
                      <TableRow key={period.id} className={period.id === selectedPeriod.id ? 'bg-primary/5' : ''}>
                        <TableCell className="font-medium">{period.month}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(period.cutoffStartDate).toLocaleDateString()} - {new Date(period.cutoffEndDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right text-sm">{period.totalEmployees}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(period.totalAmount)}</TableCell>
                        <TableCell className="text-right text-sm text-destructive">{formatCurrency(period.totalDeductions)}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-success">{formatCurrency(period.netAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[period.status]}>
                            {period.status.charAt(0).toUpperCase() + period.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPeriod(period)}
                          >
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
        </TabsContent>

        {/* Month-over-Month Comparison Tab */}
        <TabsContent value="differences">
          <Card>
            <CardHeader>
              <CardTitle>Month-over-Month Payroll Comparison</CardTitle>
              <CardDescription>Identify significant changes in employee payroll amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Previous Month</TableHead>
                      <TableHead className="text-right">Current Month</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead className="text-right">% Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayrollDifferences.map((diff) => (
                      <TableRow key={diff.employeeId}>
                        <TableCell className="font-medium">{diff.employeeName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{diff.department}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(diff.previousAmount)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(diff.currentAmount)}</TableCell>
                        <TableCell className="text-right text-sm">
                          <span className={diff.difference >= 0 ? 'text-success' : 'text-destructive'}>
                            {diff.difference >= 0 ? '+' : ''}{formatCurrency(diff.difference)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          <div className="flex items-center justify-end gap-1">
                            {diff.percentChange >= 0 ? (
                              <TrendingUp className="size-4 text-success" />
                            ) : (
                              <TrendingUp className="size-4 text-destructive rotate-180" />
                            )}
                            <span className={diff.percentChange >= 0 ? 'text-success' : 'text-destructive'}>
                              {diff.percentChange >= 0 ? '+' : ''}{diff.percentChange.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cut-off Configuration Tab */}
        <TabsContent value="cutoff">
          <Card>
            <CardHeader>
              <CardTitle>Cut-off Date Configuration</CardTitle>
              <CardDescription>Configure payroll cut-off dates and processing schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-4 border rounded-lg">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="size-4" />
                    Current Cut-off Period
                  </Label>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="text-lg font-semibold">{new Date(selectedPeriod.cutoffStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm text-muted-foreground mt-4">End Date</p>
                  <p className="text-lg font-semibold">{new Date(selectedPeriod.cutoffEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Clock className="size-4" />
                    Processing Timeline
                  </Label>
                  <div className="space-y-2 text-sm mt-4">
                    <div className="flex justify-between">
                      <span>Draft Period:</span>
                      <span className="font-medium">1 - 15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing:</span>
                      <span className="font-medium">16 - 28</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approval:</span>
                      <span className="font-medium">28 - 31</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Cut-off dates determine which transactions and timesheets are included in the payroll period. Changes to cut-off dates will affect all subsequent payroll periods.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Period Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payroll Period</DialogTitle>
            <DialogDescription>Modify the cut-off dates for this payroll period</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cut-off Start Date</Label>
              <Input type="date" defaultValue={selectedPeriod.cutoffStartDate} />
            </div>
            <div className="space-y-2">
              <Label>Cut-off End Date</Label>
              <Input type="date" defaultValue={selectedPeriod.cutoffEndDate} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={() => setEditOpen(false)}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lock Payroll Dialog */}
      <AlertDialog open={lockOpen} onOpenChange={setLockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock & Process Payroll?</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent further edits to employee data and move the payroll to processing status. This action cannot be undone immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLockPayroll} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Lock & Process'
            )}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Payroll Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Finalize Payroll</DialogTitle>
            <DialogDescription>Complete the final approval for this payroll period</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">Payroll Summary</p>
              <p className="text-muted-foreground mt-2">Total Amount: {formatCurrency(selectedPeriod.totalAmount)}</p>
              <p className="text-muted-foreground">Net Amount: {formatCurrency(selectedPeriod.netAmount)}</p>
            </div>
            <div className="space-y-2">
              <Label>Approver Name</Label>
              <Input
                placeholder="Enter your name"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
              <Button onClick={handleApprovePayroll} disabled={loading || !approverName}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve & Finalize'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payroll Period Details</DialogTitle>
            <DialogDescription>{selectedPeriod.month}</DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span>Status:</span>
                  <Badge variant="outline" className={statusStyles[selectedPeriod.status]}>
                    {selectedPeriod.status.charAt(0).toUpperCase() + selectedPeriod.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Cut-off Period:</span>
                  <span>{new Date(selectedPeriod.cutoffStartDate).toLocaleDateString()} - {new Date(selectedPeriod.cutoffEndDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Total Employees:</span>
                  <span>{selectedPeriod.totalEmployees}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Gross Payroll:</span>
                  <span className="font-semibold">{formatCurrency(selectedPeriod.totalAmount)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Deductions:</span>
                  <span className="text-destructive">{formatCurrency(selectedPeriod.totalDeductions)}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span>Net Payroll:</span>
                  <span className="text-success font-semibold">{formatCurrency(selectedPeriod.netAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
