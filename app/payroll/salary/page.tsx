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
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react'

interface SalaryRule {
  id: string
  siteId: string
  siteName: string
  position: string
  baseSalary: number
  minimumWage: number
  effectiveDate: string
  status: 'active' | 'inactive'
  notes: string
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
    baseSalary: 12000000,
    minimumWage: 4755000,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: 'Jakarta minimum wage: Rp 4.755.000',
  },
  {
    id: '2',
    siteId: 'S1',
    siteName: 'Head Office',
    position: 'Supervisor',
    baseSalary: 10000000,
    minimumWage: 4755000,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: '',
  },
  {
    id: '3',
    siteId: 'S1',
    siteName: 'Head Office',
    position: 'Guard',
    baseSalary: 11000000,
    minimumWage: 4755000,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: '',
  },
  {
    id: '4',
    siteId: 'S2',
    siteName: 'Regional Office',
    position: 'Security Head',
    baseSalary: 10500000,
    minimumWage: 3545500,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: 'Surabaya minimum wage: Rp 3.545.500',
  },
  {
    id: '5',
    siteId: 'S2',
    siteName: 'Regional Office',
    position: 'Supervisor',
    baseSalary: 8500000,
    minimumWage: 3545500,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: '',
  },
  {
    id: '6',
    siteId: 'S2',
    siteName: 'Regional Office',
    position: 'Guard',
    baseSalary: 9000000,
    minimumWage: 3545500,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: '',
  },
  {
    id: '7',
    siteId: 'S3',
    siteName: 'Branch Office',
    position: 'Security Head',
    baseSalary: 11200000,
    minimumWage: 4211000,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: 'Bandung minimum wage: Rp 4.211.000',
  },
  {
    id: '8',
    siteId: 'S3',
    siteName: 'Branch Office',
    position: 'Guard',
    baseSalary: 10200000,
    minimumWage: 4211000,
    effectiveDate: '2026-01-01',
    status: 'active',
    notes: '',
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSite, setSelectedSite] = useState('all')
  const [editingRule, setEditingRule] = useState<SalaryRule | null>(null)
  const [newRule, setNewRule] = useState<Partial<SalaryRule>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredRules = salaryRules.filter(rule => {
    const matchesSearch = rule.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.siteName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSite = selectedSite === 'all' || rule.siteId === selectedSite
    return matchesSearch && matchesSite
  })

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
        const rule: SalaryRule = {
          id: Date.now().toString(),
          siteId: newRule.siteId || '',
          siteName: mockSites.find(s => s.id === newRule.siteId)?.name || '',
          position: newRule.position || '',
          baseSalary: newRule.baseSalary || 0,
          minimumWage: mockSites.find(s => s.id === newRule.siteId)?.minimumWage || 0,
          effectiveDate: newRule.effectiveDate || new Date().toISOString().split('T')[0],
          status: 'active',
          notes: newRule.notes || '',
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

  const siteComparisonData = mockSites.map(site => {
    const siteRules = salaryRules.filter(r => r.siteId === site.id && r.status === 'active')
    const avgSalary = siteRules.length > 0
      ? siteRules.reduce((sum, r) => sum + r.baseSalary, 0) / siteRules.length
      : 0
    
    return {
      site,
      ruleCount: siteRules.length,
      avgSalary,
      totalPositions: mockPositions.length,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-muted-foreground">
            Master data for base salary by position and site
          </p>
        </div>
        <Button onClick={handleAddRule} className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Add Salary Rule
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {siteComparisonData.map(data => (
          <Card key={data.site.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{data.site.name}</CardTitle>
              <CardDescription>{data.site.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Minimum Wage</p>
                <p className="text-lg font-bold">{formatCurrency(data.site.minimumWage)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Salary (Active)</p>
                <p className="text-lg font-bold">{formatCurrency(data.avgSalary)}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {data.ruleCount} of {data.totalPositions} positions configured
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsTrigger value="rules">Salary Rules</TabsTrigger>
        <TabsTrigger value="comparison">Site Comparison</TabsTrigger>
        <TabsTrigger value="guidelines">Guidelines</TabsTrigger>

        {/* Salary Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Salary Rules Configuration</CardTitle>
              <CardDescription>
                Manage base salary for each position across different sites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search position or site..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    {mockSites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rules Table */}
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-right">Base Salary</TableHead>
                      <TableHead className="text-right">Min Wage</TableHead>
                      <TableHead className="text-right">Above Min</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map(rule => {
                      const percentageAbove = ((rule.baseSalary - rule.minimumWage) / rule.minimumWage * 100).toFixed(1)
                      return (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.siteName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {mockSites.find(s => s.id === rule.siteId)?.location}
                          </TableCell>
                          <TableCell className="font-medium">{rule.position}</TableCell>
                          <TableCell className="text-right font-semibold text-success">
                            {formatCurrency(rule.baseSalary)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {formatCurrency(rule.minimumWage)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              +{percentageAbove}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              {rule.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right gap-2 flex">
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
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Site Comparison Analysis</CardTitle>
              <CardDescription>
                Compare salary structures across different cities and minimum wage requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {siteComparisonData.map(data => (
                  <div key={data.site.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{data.site.name}</h3>
                        <p className="text-sm text-muted-foreground">{data.site.location}</p>
                      </div>
                      <Badge>{data.ruleCount} positions</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Minimum Wage</p>
                        <p className="text-lg font-bold mt-1">{formatCurrency(data.site.minimumWage)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Average Salary</p>
                        <p className="text-lg font-bold mt-1 text-success">{formatCurrency(data.avgSalary)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Salary-to-Minimum Ratio</p>
                        <p className="text-lg font-bold mt-1">
                          {data.avgSalary > 0 ? ((data.avgSalary / data.site.minimumWage).toFixed(2)) : 0}x
                        </p>
                      </div>
                    </div>

                    {/* Position breakdown for this site */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-3">Position Breakdown</p>
                      <div className="space-y-2">
                        {mockPositions.map(position => {
                          const rule = salaryRules.find(r => r.siteId === data.site.id && r.position === position && r.status === 'active')
                          return (
                            <div key={position} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded text-sm">
                              <span>{position}</span>
                              <span className="font-semibold text-success">
                                {rule ? formatCurrency(rule.baseSalary) : 'Not configured'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle>Salary Guidelines & Rules</CardTitle>
              <CardDescription>
                General guidelines for salary configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold mb-2">Minimum Wage Compliance</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    All salaries must comply with local minimum wage regulations for each city:
                  </p>
                  <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                    <li><strong>Jakarta:</strong> Rp 4.755.000 (Provincial Minimum Wage 2026)</li>
                    <li><strong>Surabaya:</strong> Rp 3.545.500 (Provincial Minimum Wage 2026)</li>
                    <li><strong>Bandung:</strong> Rp 4.211.000 (Provincial Minimum Wage 2026)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold mb-2">Salary Structure by Position</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Different positions have different salary tiers based on responsibilities:
                  </p>
                  <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                    <li><strong>Security Head:</strong> Senior position, manages team</li>
                    <li><strong>Supervisor:</strong> Mid-level, supervises operations</li>
                    <li><strong>Guard:</strong> Entry-level, field operations</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold mb-2">Site-based Adjustments</h3>
                  <p className="text-sm text-muted-foreground">
                    Salaries are adjusted per site to account for local market conditions and minimum wage requirements. The same position may have different salaries across sites.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold mb-2">Effective Dates</h3>
                  <p className="text-sm text-muted-foreground">
                    Salary rules have effective dates to track when changes were implemented. This is important for historical payroll calculations and compliance audits.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Salary Rule' : 'Add Salary Rule'}</DialogTitle>
            <DialogDescription>
              {editingRule ? 'Update the salary rule details' : 'Create a new salary rule for a position at a specific site'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Site</Label>
              <Select
                value={newRule.siteId || ''}
                onValueChange={(value) => {
                  const site = mockSites.find(s => s.id === value)
                  setNewRule({
                    ...newRule,
                    siteId: value,
                    minimumWage: site?.minimumWage || 0,
                  })
                }}
              >
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

            <div>
              <Label>Position</Label>
              <Select
                value={newRule.position || ''}
                onValueChange={(value) => setNewRule({ ...newRule, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {mockPositions.map(position => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Base Salary (Rp)</Label>
              <Input
                type="number"
                value={newRule.baseSalary || ''}
                onChange={(e) => setNewRule({ ...newRule, baseSalary: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              {newRule.siteId && newRule.baseSalary && (
                <p className="text-xs text-success mt-1">
                  {((newRule.baseSalary / (mockSites.find(s => s.id === newRule.siteId)?.minimumWage || 1) - 1) * 100).toFixed(1)}% above minimum wage
                </p>
              )}
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={newRule.notes || ''}
                onChange={(e) => setNewRule({ ...newRule, notes: e.target.value })}
                placeholder="Add any notes..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Saving...' : editingRule ? 'Update' : 'Add'}
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
            <AlertDialogAction onClick={handleDeleteRule} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
