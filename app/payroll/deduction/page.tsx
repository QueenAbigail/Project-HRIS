'use client'

import { useState } from 'react'
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
import { Plus, Edit2, Trash2 } from 'lucide-react'

interface DeductionRule {
  id: string
  name: string
  type: 'tax' | 'insurance' | 'health' | 'pension' | 'other'
  deductionType: 'percentage' | 'fixed'
  value: number
  description: string
  applicable: 'all' | 'site-specific'
  sites?: string[]
  status: 'active' | 'inactive'
  effectiveDate: string
}

const mockDeductionRules: DeductionRule[] = [
  {
    id: '1',
    name: 'Income Tax (PPh 21)',
    type: 'tax',
    deductionType: 'percentage',
    value: 5,
    description: 'Indonesian personal income tax deduction',
    applicable: 'all',
    status: 'active',
    effectiveDate: '2024-01-01',
  },
  {
    id: '2',
    name: 'Social Security (BPJS)',
    type: 'insurance',
    deductionType: 'percentage',
    value: 3.97,
    description: 'BPJS employment contribution',
    applicable: 'all',
    status: 'active',
    effectiveDate: '2024-01-01',
  },
  {
    id: '3',
    name: 'Health Insurance (BPJS Kesehatan)',
    type: 'health',
    deductionType: 'percentage',
    value: 1,
    description: 'Employee health insurance contribution',
    applicable: 'all',
    status: 'active',
    effectiveDate: '2024-01-01',
  },
  {
    id: '4',
    name: 'Pension Fund (Iuran Pesangon)',
    type: 'pension',
    deductionType: 'fixed',
    value: 500000,
    description: 'Monthly pension fund contribution',
    applicable: 'site-specific',
    sites: ['HO', 'RO'],
    status: 'active',
    effectiveDate: '2024-01-01',
  },
]

const deductionTypes = [
  {
    id: 'tax',
    name: 'Tax',
    description: 'Income tax and government levies',
    color: 'text-red-600 dark:text-red-400',
  },
  {
    id: 'insurance',
    name: 'Social Insurance',
    description: 'BPJS and employment insurance',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'health',
    name: 'Health Insurance',
    description: 'Health insurance contributions',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'pension',
    name: 'Pension',
    description: 'Pension and retirement funds',
    color: 'text-amber-600 dark:text-amber-400',
  },
]

export default function ManageDeductionPage() {
  const [deductionRules, setDeductionRules] = useState<DeductionRule[]>(mockDeductionRules)
  const [editingRule, setEditingRule] = useState<DeductionRule | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<DeductionRule>>({})

  const handleEdit = (rule: DeductionRule) => {
    setEditingRule(rule)
    setFormData(rule)
    setEditOpen(true)
  }

  const handleSave = () => {
    if (editingRule) {
      setDeductionRules(prev =>
        prev.map(r => r.id === editingRule.id ? { ...r, ...formData } as DeductionRule : r)
      )
    } else {
      setDeductionRules(prev => [...prev, { id: Date.now().toString(), ...formData } as DeductionRule])
    }
    setEditOpen(false)
    setFormData({})
  }

  const handleDelete = () => {
    if (deleteTarget) {
      setDeductionRules(prev => prev.filter(r => r.id !== deleteTarget))
      setDeleteOpen(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Manage Deduction</h1>
        <p className="text-muted-foreground mt-2">Configure salary deduction rules and rates</p>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingRule(null); setFormData({}); setEditOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Deduction Rule
        </Button>
      </div>

      {/* Deduction Rules by Type */}
      <div className="space-y-6">
        {deductionTypes.map(typeInfo => {
          const rulesOfType = deductionRules.filter(r => r.type === typeInfo.id as any)
          if (rulesOfType.length === 0) return null

          return (
            <div key={typeInfo.id} className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className={`text-lg font-semibold ${typeInfo.color}`}>{typeInfo.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{typeInfo.description}</p>
                  </div>
                  <Badge variant="secondary">{rulesOfType.length} rule{rulesOfType.length !== 1 ? 's' : ''}</Badge>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deduction Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Applicable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesOfType.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.deductionType === 'percentage' ? `${rule.value}%` : `Fixed`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {rule.deductionType === 'percentage' ? `${rule.value}%` : `Rp ${rule.value.toLocaleString('id-ID')}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        {rule.applicable === 'all' ? 'All Sites' : `${rule.sites?.length || 0} Sites`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                          {rule.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(rule)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeleteTarget(rule.id); setDeleteOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Deduction Rule' : 'Add Deduction Rule'}</DialogTitle>
            <DialogDescription>
              Configure deduction rules that will be applied to employee salaries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Deduction Name</Label>
              <Input
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Income Tax"
              />
            </div>

            <div>
              <Label>Deduction Type</Label>
              <select
                value={formData.deductionType || 'percentage'}
                onChange={e => setFormData({ ...formData, deductionType: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rp)</option>
              </select>
            </div>

            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={formData.value || ''}
                onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                placeholder={formData.deductionType === 'percentage' ? 'e.g., 5' : 'e.g., 500000'}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deduction Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deduction rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
