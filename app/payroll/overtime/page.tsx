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
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface OvertimeMultiplier {
  id: string
  hour: number
  multiplier: number
  description: string
}

interface OvertimeRule {
  id: string
  type: 'fixed' | 'replacement' | 'holiday'
  multipliers: OvertimeMultiplier[]
}

const mockOvertimeRules: OvertimeRule[] = [
  {
    id: 'fixed',
    type: 'fixed',
    multipliers: [
      { id: 'f1', hour: 1, multiplier: 1.5, description: '1st hour' },
      { id: 'f2', hour: 2, multiplier: 2.0, description: '2nd hour and onwards' },
    ],
  },
  {
    id: 'replacement',
    type: 'replacement',
    multipliers: [
      { id: 'r1', hour: 1, multiplier: 1.25, description: '1st hour' },
      { id: 'r2', hour: 2, multiplier: 1.5, description: '2nd hour' },
      { id: 'r3', hour: 3, multiplier: 1.75, description: '3rd hour' },
      { id: 'r4', hour: 4, multiplier: 2.0, description: '4th hour and onwards' },
    ],
  },
  {
    id: 'holiday',
    type: 'holiday',
    multipliers: [
      { id: 'h1', hour: 1, multiplier: 2.0, description: '1st hour' },
      { id: 'h2', hour: 2, multiplier: 2.5, description: '2nd hour' },
      { id: 'h3', hour: 3, multiplier: 3.0, description: '3rd hour and onwards' },
    ],
  },
]

const overtimeTypeConfig = {
  fixed: {
    name: 'Fixed OT',
    description: 'Overtime due to work hour rules (12-hour shifts exceeding 8-hour daily limit)',
  },
  replacement: {
    name: 'OT Replacement (BKO)',
    description: 'Overtime when personnel cannot attend and duty is replaced',
  },
  holiday: {
    name: 'OT at National Holiday',
    description: 'Overtime for personnel on duty during national holidays',
  },
}

export default function ManageOvertimePage() {
  const [rules, setRules] = useState<OvertimeRule[]>(mockOvertimeRules)
  const [editingMultiplier, setEditingMultiplier] = useState<OvertimeMultiplier | null>(null)
  const [editingType, setEditingType] = useState<'fixed' | 'replacement' | 'holiday' | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAddMultiplier = (type: 'fixed' | 'replacement' | 'holiday') => {
    setEditingType(type)
    setEditingMultiplier({
      id: `temp-${Date.now()}`,
      hour: 0,
      multiplier: 1.5,
      description: '',
    })
    setEditOpen(true)
  }

  const handleEditMultiplier = (type: 'fixed' | 'replacement' | 'holiday', multiplier: OvertimeMultiplier) => {
    setEditingType(type)
    setEditingMultiplier(multiplier)
    setEditOpen(true)
  }

  const handleSaveMultiplier = () => {
    if (!editingMultiplier || !editingType || editingMultiplier.hour <= 0) return

    setRules(prev => prev.map(rule => {
      if (rule.type === editingType) {
        const existing = rule.multipliers.find(m => m.id === editingMultiplier.id)
        if (existing) {
          return {
            ...rule,
            multipliers: rule.multipliers.map(m => m.id === editingMultiplier.id ? editingMultiplier : m),
          }
        } else {
          return {
            ...rule,
            multipliers: [...rule.multipliers, editingMultiplier].sort((a, b) => a.hour - b.hour),
          }
        }
      }
      return rule
    }))

    setEditOpen(false)
    setEditingMultiplier(null)
    setEditingType(null)
  }

  const handleDeleteMultiplier = (type: string, id: string) => {
    setDeleteTarget({ type, id })
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    setRules(prev => prev.map(rule => {
      if (rule.type === deleteTarget.type) {
        return {
          ...rule,
          multipliers: rule.multipliers.filter(m => m.id !== deleteTarget.id),
        }
      }
      return rule
    }))

    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Manage Overtime</h1>
        <p className="text-muted-foreground mt-2">Configure overtime multiplier rules for different overtime types</p>
      </div>

      {/* Overtime Types */}
      <div className="space-y-8">
        {rules.map((rule) => {
          const config = overtimeTypeConfig[rule.type]
          return (
            <div key={rule.id} className="border border-border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{config.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {rule.multipliers.length} rule{rule.multipliers.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="w-24">Hour</TableHead>
                      <TableHead className="w-24">Multiplier</TableHead>
                      <TableHead className="flex-1">Description</TableHead>
                      <TableHead className="w-20 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rule.multipliers.length > 0 ? (
                      rule.multipliers.map((multiplier) => (
                        <TableRow key={multiplier.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            {multiplier.hour === 1 ? '1st' : multiplier.hour === 2 ? '2nd' : multiplier.hour === 3 ? '3rd' : `${multiplier.hour}th`}
                          </TableCell>
                          <TableCell className="font-semibold">{multiplier.multiplier}x</TableCell>
                          <TableCell className="text-muted-foreground">{multiplier.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMultiplier(rule.type, multiplier)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMultiplier(rule.type, multiplier.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No multiplier rules configured
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Add Button */}
              <div className="px-6 py-3 border-t border-border bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddMultiplier(rule.type)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Multiplier Rule
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMultiplier?.id.startsWith('temp-') ? 'Add' : 'Edit'} Multiplier Rule
            </DialogTitle>
            <DialogDescription>
              Configure overtime multiplier for {editingType && overtimeTypeConfig[editingType].name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="hour">Hour</Label>
              <Input
                id="hour"
                type="number"
                min="1"
                value={editingMultiplier?.hour || ''}
                onChange={(e) => setEditingMultiplier(prev => prev ? { ...prev, hour: parseInt(e.target.value) || 0 } : null)}
                placeholder="e.g., 1, 2, 3"
              />
            </div>

            <div>
              <Label htmlFor="multiplier">Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                min="0.1"
                step="0.1"
                value={editingMultiplier?.multiplier || ''}
                onChange={(e) => setEditingMultiplier(prev => prev ? { ...prev, multiplier: parseFloat(e.target.value) || 0 } : null)}
                placeholder="e.g., 1.5, 2.0, 2.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editingMultiplier?.description || ''}
                onChange={(e) => setEditingMultiplier(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="e.g., 1st hour, 2nd hour and onwards"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMultiplier} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiplier Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this multiplier rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
