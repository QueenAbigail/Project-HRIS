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
import { Plus, Edit2, Trash2, Clock, AlertCircle } from 'lucide-react'

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
    description: 'Extra hours beyond 8-hour limit (Personnel working 12h/day)',
    icon: '⏰',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'replacement',
    name: 'OT Replacement (BKO)',
    description: 'Replacement duty when personnel cannot attend',
    icon: '🔄',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'holiday',
    name: 'OT at National Holiday',
    description: 'Work during national holidays with higher multiplier',
    icon: '🎄',
    color: 'bg-red-50 border-red-200 text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
  },
]

export default function OvertimeRulesPage() {
  const [multipliers, setMultipliers] = useState<OvertimeMultiplier[]>(mockOvertimeMultipliers)
  const [editingMultiplier, setEditingMultiplier] = useState<OvertimeMultiplier | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [newHourNumber, setNewHourNumber] = useState('')
  const [newMultiplier, setNewMultiplier] = useState('')
  const [addingToType, setAddingToType] = useState<string | null>(null)

  const handleEditMultiplier = (multiplier: OvertimeMultiplier) => {
    setEditingMultiplier(multiplier)
    setNewHourNumber(multiplier.hourNumber.toString())
    setNewMultiplier(multiplier.multiplier.toString())
    setEditOpen(true)
  }

  const handleSaveMultiplier = () => {
    if (!editingMultiplier || !newHourNumber || !newMultiplier) return

    setMultipliers(prev =>
      prev.map(m =>
        m.id === editingMultiplier.id
          ? {
              ...m,
              hourNumber: parseInt(newHourNumber),
              multiplier: parseFloat(newMultiplier),
              description: `${parseInt(newHourNumber)}${parseInt(newHourNumber) === 1 ? 'st' : parseInt(newHourNumber) === 2 ? 'nd' : parseInt(newHourNumber) === 3 ? 'rd' : 'th'} hour${parseInt(newHourNumber) > 1 ? ' and onwards' : ''}`,
            }
          : m
      )
    )
    setEditOpen(false)
    setEditingMultiplier(null)
  }

  const handleDeleteMultiplier = (id: string) => {
    setMultipliers(prev => prev.filter(m => m.id !== id))
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  const handleAddMultiplier = (overtimeType: string) => {
    if (!newHourNumber || !newMultiplier) return

    const newId = `new-${Date.now()}`
    const hourNum = parseInt(newHourNumber)
    
    const newMultiplierEntry: OvertimeMultiplier = {
      id: newId,
      overtimeType: overtimeType as 'fixed' | 'replacement' | 'holiday',
      hourNumber: hourNum,
      multiplier: parseFloat(newMultiplier),
      description: `${hourNum}${hourNum === 1 ? 'st' : hourNum === 2 ? 'nd' : hourNum === 3 ? 'rd' : 'th'} hour${hourNum > 1 ? ' and onwards' : ''}`,
    }

    setMultipliers(prev => [...prev, newMultiplierEntry])
    setNewHourNumber('')
    setNewMultiplier('')
    setAddingToType(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Overtime</h1>
        <p className="text-muted-foreground mt-2">
          Configure overtime rate multipliers for different overtime types
        </p>
      </div>

      {/* Overtime Types Cards */}
      {overtimeTypes.map(type => {
        const typeMultipliers = multipliers.filter(m => m.overtimeType === type.id)

        return (
          <Card key={type.id} className={`border ${type.color}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <CardTitle className="text-xl">{type.name}</CardTitle>
                    <CardDescription className="mt-1">{type.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={type.badgeColor}>
                  {typeMultipliers.length} rules
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Multipliers Table */}
              {typeMultipliers.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hour</TableHead>
                        <TableHead>Multiplier</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typeMultipliers
                        .sort((a, b) => a.hourNumber - b.hourNumber)
                        .map(multiplier => (
                          <TableRow key={multiplier.id}>
                            <TableCell className="font-medium">{multiplier.hourNumber}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-base">
                                {multiplier.multiplier}x
                              </Badge>
                            </TableCell>
                            <TableCell>{multiplier.description}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMultiplier(multiplier)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget(multiplier.id)
                                  setDeleteOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Add New Multiplier */}
              {addingToType === type.id ? (
                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`hour-${type.id}`} className="text-sm">
                        Hour Number
                      </Label>
                      <Input
                        id={`hour-${type.id}`}
                        type="number"
                        min="1"
                        value={newHourNumber}
                        onChange={e => setNewHourNumber(e.target.value)}
                        placeholder="e.g., 1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`multiplier-${type.id}`} className="text-sm">
                        Multiplier (x)
                      </Label>
                      <Input
                        id={`multiplier-${type.id}`}
                        type="number"
                        step="0.25"
                        min="0.5"
                        value={newMultiplier}
                        onChange={e => setNewMultiplier(e.target.value)}
                        placeholder="e.g., 1.5"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAddingToType(null)
                        setNewHourNumber('')
                        setNewMultiplier('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddMultiplier(type.id)}
                      disabled={!newHourNumber || !newMultiplier}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setAddingToType(type.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Multiplier Rule
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How Multipliers Work</p>
              <p>
                Multipliers are applied to the hourly base rate. For example, if an employee's hourly rate is Rp
                50,000, and they work 3 hours of overtime at 1.5x multiplier, they earn 3 × 50,000 × 1.5 = Rp 225,000
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Overtime Multiplier</DialogTitle>
            <DialogDescription>Update the multiplier rate for this overtime hour</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-hour" className="text-sm">
                Hour Number
              </Label>
              <Input
                id="edit-hour"
                type="number"
                min="1"
                value={newHourNumber}
                onChange={e => setNewHourNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-multiplier" className="text-sm">
                Multiplier (x)
              </Label>
              <Input
                id="edit-multiplier"
                type="number"
                step="0.25"
                min="0.5"
                value={newMultiplier}
                onChange={e => setNewMultiplier(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMultiplier}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Overtime Multiplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this multiplier rule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  handleDeleteMultiplier(deleteTarget)
                }
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
