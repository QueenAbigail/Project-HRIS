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
  Lock,
  Loader2,
  AlertCircle,
  Download,
  Users,
  DollarSign,
  AlertTriangle,
  Edit,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SitePayroll {
  siteId: string
  siteName: string
  location: string
  status: 'draft' | 'processing' | 'approved' | 'finalized'
  employees: number
  grossPayroll: number
  bonusAmount: number
  deductionsAmount: number
  netPayroll: number
  lastUpdated: string
}

interface SitePayrollAdjustment {
  id: string
  employee: string
  type: 'overtime' | 'bonus' | 'deduction'
  amount: number
  reason: string
  date: string
}

interface SiteValidationIssue {
  siteId: string
  severity: 'error' | 'warning'
  message: string
  affectedEmployees?: number
}

// Mock current payroll period
const currentPayrollMonth = 'March 2026'
const cutoffStartDate = '2026-03-01'
const cutoffEndDate = '2026-03-31'

// Mock data - payroll by site
const mockSitePayrolls: SitePayroll[] = [
  {
    siteId: 'S1',
    siteName: 'Head Office',
    location: 'Jakarta',
    status: 'draft',
    employees: 18,
    grossPayroll: 245000000,
    bonusAmount: 12000000,
    deductionsAmount: 55000000,
    netPayroll: 190000000,
    lastUpdated: '2026-03-31 14:30 PM',
  },
  {
    siteId: 'S2',
    siteName: 'Regional Office',
    location: 'Surabaya',
    status: 'draft',
    employees: 15,
    grossPayroll: 185000000,
    bonusAmount: 9000000,
    deductionsAmount: 42000000,
    netPayroll: 143000000,
    lastUpdated: '2026-03-31 14:30 PM',
  },
  {
    siteId: 'S3',
    siteName: 'Branch Office',
    location: 'Bandung',
    status: 'draft',
    employees: 12,
    grossPayroll: 112890000,
    bonusAmount: 7000000,
    deductionsAmount: 28000000,
    netPayroll: 84890000,
    lastUpdated: '2026-03-31 14:30 PM',
  },
]

// Mock adjustments per site
const mockSiteAdjustments: Record<string, SitePayrollAdjustment[]> = {
  'S1': [
    { id: 'adj1', employee: 'Michael Chen', type: 'overtime', amount: 1500000, reason: 'Fixed OT - 5 hours', date: '2026-03-31' },
    { id: 'adj2', employee: 'Sarah Williams', type: 'bonus', amount: 2000000, reason: 'Performance Bonus', date: '2026-03-30' },
    { id: 'adj3', employee: 'David Rodriguez', type: 'overtime', amount: 2500000, reason: 'National Holiday OT - 8 hours', date: '2026-03-29' },
    { id: 'adj4', employee: 'Emily Johnson', type: 'deduction', amount: 500000, reason: 'Loan Deduction', date: '2026-03-28' },
  ],
  'S2': [
    { id: 'adj5', employee: 'Nina Williamson', type: 'overtime', amount: 1200000, reason: 'Fixed OT - 4 hours', date: '2026-03-31' },
    { id: 'adj6', employee: 'Oscar Brown', type: 'bonus', amount: 1500000, reason: 'Attendance Bonus', date: '2026-03-30' },
    { id: 'adj7', employee: 'Patricia Davis', type: 'overtime', amount: 1800000, reason: 'BKO - Replacement Duty', date: '2026-03-29' },
  ],
  'S3': [
    { id: 'adj8', employee: 'Carlos Wright', type: 'overtime', amount: 950000, reason: 'Fixed OT - 3 hours', date: '2026-03-31' },
    { id: 'adj9', employee: 'Diana Turner', type: 'bonus', amount: 1000000, reason: 'Performance Bonus', date: '2026-03-30' },
  ],
}

// Mock validation issues per site
const mockSiteValidationIssues: SiteValidationIssue[] = [
  { siteId: 'S1', severity: 'error', message: 'Missing attendance records for 2 employees', affectedEmployees: 2 },
  { siteId: 'S1', severity: 'warning', message: 'Budget exceeded in Field Security by 3%', affectedEmployees: 5 },
  { siteId: 'S2', severity: 'warning', message: '1 employee has unsigned OT contract', affectedEmployees: 1 },
  { siteId: 'S3', severity: 'error', message: 'Missing tax documents for 1 employee', affectedEmployees: 1 },
]

export default function PayrollManagementPage() {
  const [sitePayrolls, setSitePayrolls] = useState<SitePayroll[]>(mockSitePayrolls)
  const [selectedSite, setSelectedSite] = useState<SitePayroll | null>(mockSitePayrolls[0])
  const [editOpen, setEditOpen] = useState(false)
  const [lockOpen, setLockOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const adjustmentTypeStyles = {
    overtime: 'bg-blue-100 text-blue-700',
    bonus: 'bg-green-100 text-green-700',
    deduction: 'bg-red-100 text-red-700',
  }

  const totalGrossPayroll = sitePayrolls.reduce((sum, s) => sum + s.grossPayroll, 0)
  const totalBonus = sitePayrolls.reduce((sum, s) => sum + s.bonusAmount, 0)
  const totalDeductions = sitePayrolls.reduce((sum, s) => sum + s.deductionsAmount, 0)
  const totalNetPayroll = sitePayrolls.reduce((sum, s) => sum + s.netPayroll, 0)
  const totalEmployees = sitePayrolls.reduce((sum, s) => sum + s.employees, 0)

  const handleLockAllSites = () => {
    setLoading(true)
    setTimeout(() => {
      setSitePayrolls(prev => prev.map(s => ({ ...s, status: 'processing' as const })))
      setLoading(false)
      setLockOpen(false)
    }, 1000)
  }

  const handleLockSite = () => {
    if (!selectedSite) return
    setLoading(true)
    setTimeout(() => {
      setSitePayrolls(prev =>
        prev.map(s =>
          s.siteId === selectedSite.siteId
            ? { ...s, status: 'processing' as const, lastUpdated: new Date().toLocaleString() }
            : s
        )
      )
      setSelectedSite(prev => prev ? { ...prev, status: 'processing', lastUpdated: new Date().toLocaleString() } : null)
      setLoading(false)
      setLockOpen(false)
    }, 1000)
  }

  const siteValidationIssues = selectedSite
    ? mockSiteValidationIssues.filter(issue => issue.siteId === selectedSite.siteId)
    : []

  const siteAdjustments = selectedSite ? (mockSiteAdjustments[selectedSite.siteId] || []) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">
            Manage current month payroll by site - Cut-off Period: {new Date(cutoffStartDate).toLocaleDateString()} to {new Date(cutoffEndDate).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="size-4 mr-2" />
          Export All Sites
        </Button>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="size-4" />
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEmployees}</p>
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
            <p className="text-2xl font-bold">{formatCurrency(totalGrossPayroll)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="size-4" />
              Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalBonus)}</p>
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
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDeductions)}</p>
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
            <p className="text-2xl font-bold text-success">{formatCurrency(totalNetPayroll)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Site Selection and Management */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Site Overview</TabsTrigger>
          <TabsTrigger value="details">Site Details</TabsTrigger>
          <TabsTrigger value="validation">Issues & Validation</TabsTrigger>
        </TabsList>

        {/* Site Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Sites - Current Month ({currentPayrollMonth})</CardTitle>
              <CardDescription>Click on a site to view details and manage payroll adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site Name</TableHead>
                      <TableHead className="text-right">Location</TableHead>
                      <TableHead className="text-right">Employees</TableHead>
                      <TableHead className="text-right">Gross Payroll</TableHead>
                      <TableHead className="text-right">Bonus</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Payroll</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sitePayrolls.map((site) => (
                      <TableRow key={site.siteId} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{site.siteName}</TableCell>
                        <TableCell className="text-right text-sm">{site.location}</TableCell>
                        <TableCell className="text-right text-sm">{site.employees}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(site.grossPayroll)}</TableCell>
                        <TableCell className="text-right text-sm text-success">{formatCurrency(site.bonusAmount)}</TableCell>
                        <TableCell className="text-right text-sm text-destructive">{formatCurrency(site.deductionsAmount)}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-success">{formatCurrency(site.netPayroll)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[site.status]}>
                            {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSite(site)}
                          >
                            View Details
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

        {/* Site Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {selectedSite ? (
            <div className="space-y-4">
              {/* Site Header */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <MapPin className="size-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedSite.siteName}</CardTitle>
                        <CardDescription className="mt-2">
                          {selectedSite.location} • {selectedSite.employees} Employees • {currentPayrollMonth}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={statusStyles[selectedSite.status]}>
                        {selectedSite.status.charAt(0).toUpperCase() + selectedSite.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Site Summary Cards */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Gross Payroll</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(selectedSite.grossPayroll)}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Bonus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-success">{formatCurrency(selectedSite.bonusAmount)}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Deductions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-destructive">{formatCurrency(selectedSite.deductionsAmount)}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Net Payroll</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-success">{formatCurrency(selectedSite.netPayroll)}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Site Actions */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Last updated: {selectedSite.lastUpdated}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedSite.status === 'draft' && (
                        <>
                          <Button variant="outline">
                            <Edit className="size-4 mr-2" />
                            Edit Payroll
                          </Button>
                          <Button onClick={() => setLockOpen(true)}>
                            <Lock className="size-4 mr-2" />
                            Lock Site
                          </Button>
                        </>
                      )}
                      {selectedSite.status === 'processing' && (
                        <Button disabled>
                          Processing...
                        </Button>
                      )}
                      <Button variant="outline">
                        <Download className="size-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payroll Adjustments */}
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Adjustments</CardTitle>
                  <CardDescription>Overtime, bonuses, and deductions for this site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {siteAdjustments.map((adj) => (
                          <TableRow key={adj.id}>
                            <TableCell className="font-medium">{adj.employee}</TableCell>
                            <TableCell>
                              <Badge className={adjustmentTypeStyles[adj.type]}>
                                {adj.type.charAt(0).toUpperCase() + adj.type.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-right">{formatCurrency(adj.amount)}</TableCell>
                            <TableCell className="text-sm">{adj.reason}</TableCell>
                            <TableCell className="text-sm">{adj.date}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button className="mt-4" variant="outline">
                    Add Adjustment
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Select a site from the Site Overview tab to view details
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Validation Issues Tab */}
        <TabsContent value="validation" className="space-y-4">
          {selectedSite ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-destructive" />
                  Validation Issues - {selectedSite.siteName}
                </CardTitle>
                <CardDescription>Issues that need to be resolved before payroll finalization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {siteValidationIssues.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Check className="size-8 mx-auto mb-2 text-success" />
                    No validation issues for this site
                  </div>
                ) : (
                  siteValidationIssues.map((issue) => (
                    <div
                      key={`${issue.siteId}-${issue.message}`}
                      className={`rounded-lg border p-4 ${severityStyles[issue.severity]}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="size-5 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">{issue.message}</p>
                          {issue.affectedEmployees && (
                            <p className="text-sm mt-1 opacity-90">Affected: {issue.affectedEmployees} employee(s)</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Select a site from the Site Overview tab to view validation issues
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Lock Site Dialog */}
      <AlertDialog open={lockOpen} onOpenChange={setLockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock Site Payroll</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to lock the payroll for {selectedSite?.siteName}. Once locked, it cannot be edited further.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Payroll Summary:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Employees: {selectedSite?.employees}</div>
              <div>Gross: {formatCurrency(selectedSite?.grossPayroll || 0)}</div>
              <div>Bonus: {formatCurrency(selectedSite?.bonusAmount || 0)}</div>
              <div>Deductions: {formatCurrency(selectedSite?.deductionsAmount || 0)}</div>
            </div>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLockSite} disabled={loading}>
            {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            {loading ? 'Locking...' : 'Lock Payroll'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
