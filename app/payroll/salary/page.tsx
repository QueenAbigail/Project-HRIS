'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, MapPin, Loader2, Save, X } from 'lucide-react'

interface SalaryRule {
  id: string
  siteId: string
  siteName: string
  position: string
  positionAllowance: number
  baseSalary: number
  minimumWage: number
  effectiveDate: string
  status: 'active' | 'inactive'
}

interface Site {
  id: string
  name: string
  location: string
  minimumWage: number
}

const mockSites: Site[] = [
  { id: 'S1', name: 'Head Office', location: 'Jakarta', minimumWage: 4755000 },
  { id: 'S2', name: 'Regional Office', location: 'Surabaya', minimumWage: 3545500 },
  { id: 'S3', name: 'Branch Office', location: 'Bandung', minimumWage: 4211000 },
]

const mockPositions = [
  'Security Head',
  'Supervisor',
  'Guard',
  'Receptionist',
  'Administration Officer',
]

const mockSalaryRules: SalaryRule[] = [
  {
    id: '1',
    siteId: 'S1',
    siteName: 'Head Office',
    position: 'Security Head',
    positionAllowance: 7245000,
    baseSalary: 12000000,
    minimumWage: 4755000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '2',
    siteId: 'S1',
    siteName: 'Head Office',
    position: 'Supervisor',
    positionAllowance: 5245000,
    baseSalary: 10000000,
    minimumWage: 4755000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '3',
    siteId: 'S1',
    siteName: 'Head Office',
    position: 'Guard',
    positionAllowance: 6245000,
    baseSalary: 11000000,
    minimumWage: 4755000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '4',
    siteId: 'S2',
    siteName: 'Regional Office',
    position: 'Security Head',
    positionAllowance: 6954500,
    baseSalary: 10500000,
    minimumWage: 3545500,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '5',
    siteId: 'S2',
    siteName: 'Regional Office',
    position: 'Supervisor',
    positionAllowance: 4954500,
    baseSalary: 8500000,
    minimumWage: 3545500,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '6',
    siteId: 'S2',
    siteName: 'Regional Office',
    position: 'Guard',
    positionAllowance: 5454500,
    baseSalary: 9000000,
    minimumWage: 3545500,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '7',
    siteId: 'S3',
    siteName: 'Branch Office',
    position: 'Security Head',
    positionAllowance: 6789000,
    baseSalary: 11000000,
    minimumWage: 4211000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '8',
    siteId: 'S3',
    siteName: 'Branch Office',
    position: 'Guard',
    positionAllowance: 5989000,
    baseSalary: 10200000,
    minimumWage: 4211000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ManageSalaryPage() {
  const [salaryRules, setSalaryRules] = useState<SalaryRule[]>(mockSalaryRules)
  const [sites, setSites] = useState<Site[]>(mockSites)
  const [editingAllowance, setEditingAllowance] = useState<SalaryRule | null>(null)
  const [editingMinWage, setEditingMinWage] = useState<Site | null>(null)
  const [editAllowanceOpen, setEditAllowanceOpen] = useState(false)
  const [editMinWageOpen, setEditMinWageOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [allowanceValue, setAllowanceValue] = useState('')
  const [minWageValue, setMinWageValue] = useState('')

  const handleEditAllowance = (rule: SalaryRule) => {
    setEditingAllowance(rule)
    setAllowanceValue(rule.positionAllowance.toString())
    setEditAllowanceOpen(true)
  }

  const handleSaveAllowance = () => {
    if (!editingAllowance) return
    setLoading(true)
    setTimeout(() => {
      setSalaryRules(prev => prev.map(rule => 
        rule.id === editingAllowance.id 
          ? {
              ...rule,
              positionAllowance: parseInt(allowanceValue),
              baseSalary: rule.minimumWage + parseInt(allowanceValue),
            }
          : rule
      ))
      setLoading(false)
      setEditAllowanceOpen(false)
      setEditingAllowance(null)
    }, 500)
  }

  const handleEditMinWage = (site: Site) => {
    setEditingMinWage(site)
    setMinWageValue(site.minimumWage.toString())
    setEditMinWageOpen(true)
  }

  const handleSaveMinWage = () => {
    if (!editingMinWage) return
    setLoading(true)
    setTimeout(() => {
      const newMinWage = parseInt(minWageValue)
      setSites(prev => prev.map(site => 
        site.id === editingMinWage.id 
          ? { ...site, minimumWage: newMinWage }
          : site
      ))
      setSalaryRules(prev => prev.map(rule =>
        rule.siteId === editingMinWage.id
          ? { ...rule, minimumWage: newMinWage, baseSalary: newMinWage + rule.positionAllowance }
          : rule
      ))
      setLoading(false)
      setEditMinWageOpen(false)
      setEditingMinWage(null)
    }, 500)
  }

  const handleDelete = (id: string) => {
    setLoading(true)
    setTimeout(() => {
      setSalaryRules(prev => prev.filter(rule => rule.id !== id))
      setLoading(false)
      setDeleteOpen(false)
      setDeleteTarget(null)
    }, 500)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Salary</h1>
        <p className="text-muted-foreground mt-2">
          Configure base salary by position for each site. All positions start with minimum wage plus position allowance.
        </p>
      </div>

      {/* Sites */}
      <div className="space-y-6">
        {mockSites.map((site) => (
          <Card key={site.id}>
            {/* Site Header Bar */}
            <div className="flex items-center border-b bg-muted/30">
              <div className="flex-1 px-6 py-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <div>
                  <h2 className="font-semibold text-lg">{site.name}</h2>
                  <p className="text-sm text-muted-foreground">{site.location}</p>
                </div>
              </div>
              <div className="border-l border-border h-16 flex items-center px-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Minimum Wage</p>
                  <p className="font-semibold">{formatCurrency(site.minimumWage)}</p>
                </div>
              </div>
            </div>

            {/* Content - Split Layout */}
            <div className="flex">
              {/* Left: Position Salary */}
              <div className="flex-1 border-r">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Position Salary</CardTitle>
                  <CardDescription>Manage position allowances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead className="text-right">Position Allowance</TableHead>
                          <TableHead className="text-right">Base Salary</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salaryRules
                          .filter(rule => rule.siteId === site.id)
                          .map(rule => (
                            <TableRow key={rule.id}>
                              <TableCell className="font-medium">{rule.position}</TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatCurrency(rule.positionAllowance)}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(rule.baseSalary)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                                  {rule.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditAllowance(rule)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteTarget(rule.id)
                                      setDeleteOpen(true)
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </div>

              {/* Right: Manage Base Salary */}
              <div className="w-80 bg-muted/20 p-6 flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-4">Manage Base Salary</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Minimum Wage for {site.name}</Label>
                        <p className="text-sm font-semibold text-primary mb-3">
                          {formatCurrency(site.minimumWage)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleEditMinWage(site)}
                        >
                          Update Minimum Wage
                        </Button>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-3">
                          Base Salary Formula: Minimum Wage + Position Allowance
                        </p>
                        <Button
                          size="sm"
                          className="w-full gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Position
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Allowance Dialog */}
      <Dialog open={editAllowanceOpen} onOpenChange={setEditAllowanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Position Allowance</DialogTitle>
            <DialogDescription>
              {editingAllowance?.position} at {editingAllowance?.siteName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Position Allowance</Label>
              <Input
                type="number"
                value={allowanceValue}
                onChange={(e) => setAllowanceValue(e.target.value)}
                placeholder="Enter allowance amount"
                className="mt-2"
              />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Calculated Base Salary:</p>
              <p className="font-semibold">
                {formatCurrency((editingAllowance?.minimumWage || 0) + parseInt(allowanceValue || '0'))}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditAllowanceOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveAllowance} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Minimum Wage Dialog */}
      <Dialog open={editMinWageOpen} onOpenChange={setEditMinWageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Minimum Wage</DialogTitle>
            <DialogDescription>
              {editingMinWage?.name} - {editingMinWage?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Minimum Wage</Label>
              <Input
                type="number"
                value={minWageValue}
                onChange={(e) => setMinWageValue(e.target.value)}
                placeholder="Enter minimum wage"
                className="mt-2"
              />
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="text-muted-foreground mb-2">This change will update base salary for all positions at this site.</p>
              <p className="text-xs text-muted-foreground">New Base Salary = {formatCurrency(parseInt(minWageValue || '0'))} + Position Allowance</p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditMinWageOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveMinWage} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salary Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this salary rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
