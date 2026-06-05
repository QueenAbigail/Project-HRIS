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
import { Switch } from '@/components/ui/switch'
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
    baseSalary: 11200000,
    minimumWage: 4211000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '8',
    siteId: 'S3',
    siteName: 'Branch Office',
    position: 'Supervisor',
    positionAllowance: 4789000,
    baseSalary: 9000000,
    minimumWage: 4211000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
  {
    id: '9',
    siteId: 'S3',
    siteName: 'Branch Office',
    position: 'Guard',
    positionAllowance: 5789000,
    baseSalary: 10200000,
    minimumWage: 4211000,
    effectiveDate: '2026-01-01',
    status: 'active',
  },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export default function ManageSalaryPage() {
  const [view, setView] = useState<'position' | 'base'>('position')
  const [salaryRules, setSalaryRules] = useState<SalaryRule[]>(mockSalaryRules)
  const [editingRule, setEditingRule] = useState<SalaryRule | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [editingMinWage, setEditingMinWage] = useState<{ siteId: string; wage: number } | null>(null)
  const [minWageEditOpen, setMinWageEditOpen] = useState(false)
  const [showAllPositions, setShowAllPositions] = useState(false)

  const groupedRules = mockSites.map(site => {
    let rulesForSite = salaryRules.filter(r => r.siteId === site.id)
    
    // If showAllPositions is true, add empty rules for positions that don't have entries
    if (showAllPositions) {
      const existingPositions = rulesForSite.map(r => r.position)
      const missingPositions = mockPositions.filter(p => !existingPositions.includes(p))
      
      missingPositions.forEach(position => {
        rulesForSite.push({
          id: `temp-${site.id}-${position}`,
          siteId: site.id,
          siteName: site.name,
          position,
          positionAllowance: 0,
          baseSalary: site.minimumWage,
          minimumWage: site.minimumWage,
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'active',
        })
      })
    }
    
    return {
      siteId: site.id,
      siteName: site.name,
      location: site.location,
      minimumWage: site.minimumWage,
      rules: rulesForSite,
    }
  }).filter(group => group.rules.length > 0)

  const handleEditRule = (rule: SalaryRule) => {
    setEditingRule(rule)
    setEditOpen(true)
  }

  const handleSaveRule = () => {
    if (editingRule) {
      setSalaryRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r))
      setEditOpen(false)
      setEditingRule(null)
    }
  }

  const handleDeleteRule = (id: string) => {
    setDeleteTarget(id)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      setSalaryRules(prev => prev.filter(r => r.id !== deleteTarget))
      setDeleteOpen(false)
      setDeleteTarget(null)
    }
  }

  const handleEditMinWage = (siteId: string, wage: number) => {
    setEditingMinWage({ siteId, wage })
    setMinWageEditOpen(true)
  }

  const handleSaveMinWage = () => {
    if (editingMinWage) {
      setSalaryRules(prev => prev.map(r => 
        r.siteId === editingMinWage.siteId 
          ? { ...r, minimumWage: editingMinWage.wage }
          : r
      ))
      setMinWageEditOpen(false)
      setEditingMinWage(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manage Salary</h1>
        <p className="text-muted-foreground mt-2">
          Configure base salary by position for each site. All positions start with minimum wage plus position allowance.
        </p>
      </div>

      {/* View Selector Bar - Elegant Design */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-0 border border-border rounded-lg overflow-hidden bg-background shadow-sm">
          <button
            onClick={() => setView('position')}
            className={`px-6 py-2.5 font-medium text-sm transition-all ${
              view === 'position'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground bg-muted/20'
            }`}
          >
            Position Salary
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={() => setView('base')}
            className={`px-6 py-2.5 font-medium text-sm transition-all ${
              view === 'base'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground bg-muted/20'
            }`}
          >
            Manage Base Salary
          </button>
        </div>

        {/* Show All Positions Toggle - Only visible in Position Salary view */}
        {view === 'position' && (
          <div className="flex items-center gap-3 px-4 py-2.5 border border-border rounded-lg bg-muted/30">
            <Label htmlFor="show-all" className="text-sm font-medium cursor-pointer">
              Show All Positions
            </Label>
            <Switch
              id="show-all"
              checked={showAllPositions}
              onCheckedChange={setShowAllPositions}
            />
          </div>
        )}
      </div>

      {/* Position Salary View */}
      {view === 'position' && (
        <div className="space-y-6">
          {groupedRules.map((group) => (
            <Card key={group.siteId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle>{group.siteName}</CardTitle>
                      <CardDescription>
                        {group.location} • Minimum Wage: {formatCurrency(group.minimumWage)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{group.rules.length} Positions</Badge>
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
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.position}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(rule.minimumWage)}</TableCell>
                          <TableCell className="text-right text-sm text-success">{formatCurrency(rule.positionAllowance)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(rule.baseSalary)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                              {rule.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manage Base Salary View */}
      {view === 'base' && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {mockSites.map((site) => {
              const currentMinWage = salaryRules.find(r => r.siteId === site.id)?.minimumWage || site.minimumWage
              return (
                <Card key={site.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle>{site.name}</CardTitle>
                          <CardDescription>{site.location}</CardDescription>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEditMinWage(site.id, currentMinWage)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Set Minimum Wage
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Current Minimum Wage</Label>
                      <p className="text-3xl font-bold mt-2">{formatCurrency(currentMinWage)}</p>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• All positions at this site will use this minimum wage as their base calculation</p>
                      <p>• Position allowances are added to this minimum wage to calculate final base salary</p>
                      <p>• Updating this value will affect all position calculations for {site.name}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Edit Position Allowance Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Position Salary</DialogTitle>
            <DialogDescription>
              Update the position allowance for {editingRule?.position} at {editingRule?.siteName}
            </DialogDescription>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4">
              <div>
                <Label>Position Allowance</Label>
                <Input
                  type="number"
                  value={editingRule.positionAllowance}
                  onChange={(e) => {
                    const newAllowance = parseInt(e.target.value) || 0
                    setEditingRule({
                      ...editingRule,
                      positionAllowance: newAllowance,
                      baseSalary: editingRule.minimumWage + newAllowance,
                    })
                  }}
                  className="mt-2"
                />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Base Salary Calculation:</p>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(editingRule.minimumWage)} + {formatCurrency(editingRule.positionAllowance)} = {formatCurrency(editingRule.baseSalary)}
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveRule} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Minimum Wage Dialog */}
      <Dialog open={minWageEditOpen} onOpenChange={setMinWageEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Minimum Wage</DialogTitle>
            <DialogDescription>
              Set the minimum wage for {editingMinWage && mockSites.find(s => s.id === editingMinWage.siteId)?.name}
            </DialogDescription>
          </DialogHeader>
          {editingMinWage && (
            <div className="space-y-4">
              <div>
                <Label>Minimum Wage</Label>
                <Input
                  type="number"
                  value={editingMinWage.wage}
                  onChange={(e) => setEditingMinWage({ ...editingMinWage, wage: parseInt(e.target.value) || 0 })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This is the base salary for all positions at this site before position allowance is added.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setMinWageEditOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveMinWage} className="gap-2">
                  <Save className="h-4 w-4" />
                  Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Salary Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this salary rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
