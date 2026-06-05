'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Plus, Edit2, Trash2, MapPin, Loader2 } from 'lucide-react'

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
    positionAllowance: 6989000,
    baseSalary: 11200000,
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function SalaryPage() {
  const [salaryRules, setSalaryRules] = useState<SalaryRule[]>(mockSalaryRules)
  const [editingRule, setEditingRule] = useState<SalaryRule | null>(null)
  const [newRule, setNewRule] = useState<Partial<SalaryRule>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAddRule = () => {
    setEditingRule(null)
    setNewRule({})
    setDialogOpen(true)
  }

  const handleEditRule = (rule: SalaryRule) => {
    setEditingRule(rule)
    setNewRule(rule)
    setDialogOpen(true)
  }

  const handleSaveRule = () => {
    setLoading(true)
    setTimeout(() => {
      if (editingRule) {
        setSalaryRules(salaryRules.map(r => r.id === editingRule.id ? { ...editingRule, ...newRule } as SalaryRule : r))
      } else {
        const site = mockSites.find(s => s.id === newRule.siteId)
        const rule: SalaryRule = {
          id: Date.now().toString(),
          siteId: newRule.siteId || '',
          siteName: site?.name || '',
          position: newRule.position || '',
          positionAllowance: newRule.positionAllowance || 0,
          baseSalary: (site?.minimumWage || 0) + (newRule.positionAllowance || 0),
          minimumWage: site?.minimumWage || 0,
          effectiveDate: newRule.effectiveDate || new Date().toISOString().split('T')[0],
          status: 'active',
        }
        setSalaryRules([...salaryRules, rule])
      }
      setLoading(false)
      setDialogOpen(false)
    }, 500)
  }

  const handleDeleteRule = () => {
    if (deleteTarget) {
      setSalaryRules(salaryRules.filter(r => r.id !== deleteTarget))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Salary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure base salary by position for each site. All positions start with minimum wage plus position allowance.
          </p>
        </div>
        <Button onClick={handleAddRule} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Salary Rule
        </Button>
      </div>

      {/* Sites */}
      <div className="space-y-6">
        {mockSites.map(site => {
          const siteRules = salaryRules.filter(r => r.siteId === site.id && r.status === 'active')

          return (
            <Card key={site.id}>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>{site.name}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      {site.location} • Minimum Wage: <span className="font-semibold text-foreground">{formatCurrency(site.minimumWage)}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{siteRules.length} Positions</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-right">Min Wage</TableHead>
                        <TableHead className="text-right">Position Allowance</TableHead>
                        <TableHead className="text-right">Base Salary</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {siteRules.length > 0 ? (
                        siteRules.map(rule => (
                          <TableRow key={rule.id}>
                            <TableCell className="font-medium">{rule.position}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(rule.minimumWage)}</TableCell>
                            <TableCell className="text-right text-sm text-success">{formatCurrency(rule.positionAllowance)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(rule.baseSalary)}</TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-success/20 text-success hover:bg-success/30">{rule.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRule(rule)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteTarget(rule.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No salary rules configured for this site
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Salary Rule' : 'Add Salary Rule'}</DialogTitle>
            <DialogDescription>
              Configure base salary calculation: Minimum Wage + Position Allowance = Base Salary
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Site</Label>
              <Select value={newRule.siteId || ''} onValueChange={(value) => setNewRule({ ...newRule, siteId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {mockSites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name} ({site.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newRule.siteId && (
              <div className="bg-muted p-3 rounded text-sm">
                <p className="text-muted-foreground">Minimum Wage (Site): <span className="font-semibold text-foreground">{formatCurrency(mockSites.find(s => s.id === newRule.siteId)?.minimumWage || 0)}</span></p>
              </div>
            )}

            <div>
              <Label>Position</Label>
              <Select value={newRule.position || ''} onValueChange={(value) => setNewRule({ ...newRule, position: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {mockPositions.map(pos => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Position Allowance</Label>
              <Input
                type="number"
                value={newRule.positionAllowance || ''}
                onChange={(e) => {
                  const allowance = parseFloat(e.target.value) || 0
                  const minimumWage = mockSites.find(s => s.id === newRule.siteId)?.minimumWage || 0
                  setNewRule({
                    ...newRule,
                    positionAllowance: allowance,
                    baseSalary: minimumWage + allowance,
                  })
                }}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Amount added to minimum wage</p>
            </div>

            {newRule.baseSalary && (
              <div className="bg-success/10 p-3 rounded text-sm">
                <p className="text-muted-foreground">Calculated Base Salary: <span className="font-semibold text-success">{formatCurrency(newRule.baseSalary)}</span></p>
              </div>
            )}

            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={newRule.effectiveDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewRule({ ...newRule, effectiveDate: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule} disabled={loading || !newRule.siteId || !newRule.position || !newRule.positionAllowance}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salary Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this salary rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
