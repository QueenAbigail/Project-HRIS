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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Clock, AlertCircle, ChevronRight } from 'lucide-react'

interface OvertimeMultiplier {
  id: string
  overtimeType: 'fixed' | 'replacement' | 'holiday'
  hourNumber: number
  multiplier: number
  description: string
}

const mockOvertimeMultipliers: OvertimeMultiplier[] = [
  // Fixed OT
  { id: '1', overtimeType: 'fixed', hourNumber: 1, multiplier: 1.5, description: '1st hour' },
  { id: '2', overtimeType: 'fixed', hourNumber: 2, multiplier: 2.0, description: '2nd hour and onwards' },
  // OT Replacement (BKO)
  { id: '3', overtimeType: 'replacement', hourNumber: 1, multiplier: 1.25, description: '1st hour' },
  { id: '4', overtimeType: 'replacement', hourNumber: 2, multiplier: 1.5, description: '2nd hour' },
  { id: '5', overtimeType: 'replacement', hourNumber: 3, multiplier: 1.75, description: '3rd hour' },
  { id: '6', overtimeType: 'replacement', hourNumber: 4, multiplier: 2.0, description: '4th hour and onwards' },
  // OT at National Holiday
  { id: '7', overtimeType: 'holiday', hourNumber: 1, multiplier: 2.0, description: '1st hour' },
  { id: '8', overtimeType: 'holiday', hourNumber: 2, multiplier: 2.5, description: '2nd hour' },
  { id: '9', overtimeType: 'holiday', hourNumber: 3, multiplier: 3.0, description: '3rd hour and onwards' },
]

const overtimeTypes = [
  {
    id: 'fixed',
    name: 'Fixed OT',
    description: 'Overtime due to work hour rules (12-hour shifts exceeding 8-hour daily limit)',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800',
    accentColor: 'text-blue-600',
  },
  {
    id: 'replacement',
    name: 'OT Replacement (BKO)',
    description: 'Overtime when personnel cannot attend and duty is replaced',
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-900',
    badgeColor: 'bg-amber-100 text-amber-800',
    accentColor: 'text-amber-600',
  },
  {
    id: 'holiday',
    name: 'OT at National Holiday',
    description: 'Overtime for personnel on duty during national holidays',
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-900',
    badgeColor: 'bg-red-100 text-red-800',
    accentColor: 'text-red-600',
  },
]

export default function OvertimeRulesPage() {
  const [multipliers, setMultipliers] = useState<OvertimeMultiplier[]>(mockOvertimeMultipliers)
  const [editingRule, setEditingRule] = useState<OvertimeMultiplier | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [newMultiplier, setNewMultiplier] = useState('1.5')
  const [newHourNumber, setNewHourNumber] = useState('1')

  const handleAddRule = (overtimeTypeId: string) => {
    const newRule: OvertimeMultiplier = {
      id: `temp-${Date.now()}`,
      overtimeType: overtimeTypeId as 'fixed' | 'replacement' | 'holiday',
      hourNumber: parseInt(newHourNumber),
      multiplier: parseFloat(newMultiplier),
      description: `Hour ${newHourNumber}`,
    }
    setMultipliers([...multipliers, newRule])
    setNewMultiplier('1.5')
    setNewHourNumber('1')
  }

  const handleDeleteRule = (id: string) => {
    setMultipliers(multipliers.filter(m => m.id !== id))
    setDeleteOpen(false)
  }

  const handleEditRule = (rule: OvertimeMultiplier) => {
    setEditingRule(rule)
    setNewMultiplier(rule.multiplier.toString())
    setNewHourNumber(rule.hourNumber.toString())
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingRule) {
      setMultipliers(
        multipliers.map(m =>
          m.id === editingRule.id
            ? {
                ...m,
                multiplier: parseFloat(newMultiplier),
                hourNumber: parseInt(newHourNumber),
                description: `Hour ${newHourNumber}`,
              }
            : m
        )
      )
      setEditOpen(false)
      setEditingRule(null)
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Overtime Rules</h1>
        <p className="text-sm text-muted-foreground">
          Configure overtime multiplier rates for each overtime category. These rules determine how overtime compensation is calculated.
        </p>
      </div>

      {/* Overtime Types */}
      <div className="space-y-6">
        {overtimeTypes.map(overtimeType => {
          const rules = multipliers.filter(m => m.overtimeType === overtimeType.id)

          return (
            <div key={overtimeType.id} className={`border rounded-lg ${overtimeType.color} transition-colors`}>
              {/* Header */}
              <div className={`px-6 py-4 border-b ${overtimeType.color}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className={`text-lg font-semibold ${overtimeType.textColor} mb-1`}>{overtimeType.name}</h2>
                    <p className={`text-sm ${overtimeType.textColor} opacity-75`}>{overtimeType.description}</p>
                  </div>
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${overtimeType.badgeColor}`}>
                    {rules.length} rule{rules.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {rules.length > 0 ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-lg border border-border/50">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">Hour</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">Multiplier</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">Description</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {rules.map(rule => (
                            <tr key={rule.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-foreground">{rule.hourNumber}</td>
                              <td className={`px-4 py-3 font-semibold ${overtimeType.accentColor}`}>
                                {rule.multiplier}x
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{rule.description}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRule(rule)}
                                    className="h-8 px-2"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setDeleteTarget(rule.id)
                                      setDeleteOpen(true)
                                    }}
                                    className="h-8 px-2 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRule(overtimeType.id)}
                      className="w-full gap-2 mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Multiplier Rule
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className={`h-10 w-10 ${overtimeType.textColor} opacity-30 mx-auto mb-2`} />
                    <p className={`text-sm ${overtimeType.textColor} opacity-60`}>No multiplier rules configured</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRule(overtimeType.id)}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Rule
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Guidelines */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <CardTitle className="text-amber-900">Configuration Guidelines</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-900">
          <p>
            <span className="font-semibold">Multiplier Calculation:</span> Final overtime pay = Hourly Rate × Multiplier. Multipliers should increase with additional hours to incentivize fair compensation.
          </p>
          <p>
            <span className="font-semibold">Best Practices:</span> Configure rules in ascending order by hour number. Use progressive multipliers (1.5x, 2.0x, 2.5x) to reflect increasing burden of extended work.
          </p>
          <p>
            <span className="font-semibold">National Holiday OT:</span> Typically uses higher multipliers (2.0x+) as employees sacrifice holiday time.
          </p>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Multiplier Rule</DialogTitle>
            <DialogDescription>Update the overtime multiplier configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-hour">Hour Number</Label>
              <Input
                id="edit-hour"
                type="number"
                min="1"
                value={newHourNumber}
                onChange={e => setNewHourNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-multiplier">Multiplier Value</Label>
              <Input
                id="edit-multiplier"
                type="number"
                step="0.1"
                min="0.5"
                value={newMultiplier}
                onChange={e => setNewMultiplier(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rule</DialogTitle>
            <DialogDescription>Are you sure you want to delete this multiplier rule? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) handleDeleteRule(deleteTarget)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
