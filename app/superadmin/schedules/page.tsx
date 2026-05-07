'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  CalendarDays, 
  Plus, 
  Edit, 
  Trash2, 
  Sun, 
  Moon, 
  Coffee, 
  RotateCcw,
  Users,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

// Schedule pattern types
type PatternType = 'fixed' | 'rotating'
type ShiftType = 'morning' | 'night' | 'off'

interface SchedulePattern {
  id: string
  name: string
  description: string
  type: PatternType
  // For fixed patterns
  workingDays?: number[] // 0=Sunday, 1=Monday, etc.
  shiftId?: string
  // For rotating patterns
  rotatingPattern?: {
    sequence: { days: number; shiftType: ShiftType }[]
    startDate: string // When the pattern starts
  }
  isActive: boolean
  assignedEmployees: number
}

// Mock data for schedule patterns
const initialPatterns: SchedulePattern[] = [
  {
    id: 'pattern-1',
    name: 'Standard Weekday',
    description: 'Monday to Friday, Morning Shift',
    type: 'fixed',
    workingDays: [1, 2, 3, 4, 5],
    shiftId: 'morning',
    isActive: true,
    assignedEmployees: 45,
  },
  {
    id: 'pattern-2',
    name: '2-2-2 Rotation',
    description: '2 days morning, 2 days night, 2 days off - rotating',
    type: 'rotating',
    rotatingPattern: {
      sequence: [
        { days: 2, shiftType: 'morning' },
        { days: 2, shiftType: 'night' },
        { days: 2, shiftType: 'off' },
      ],
      startDate: '2026-01-01',
    },
    isActive: true,
    assignedEmployees: 28,
  },
  {
    id: 'pattern-3',
    name: 'Weekend Security',
    description: 'Saturday and Sunday, Night Shift',
    type: 'fixed',
    workingDays: [0, 6],
    shiftId: 'night',
    isActive: true,
    assignedEmployees: 12,
  },
]

const shiftOptions = [
  { id: 'morning', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', icon: Sun },
  { id: 'day', name: 'Day Shift', startTime: '08:00', endTime: '16:00', icon: Sun },
  { id: 'evening', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', icon: Sun },
  { id: 'night', name: 'Night Shift', startTime: '22:00', endTime: '06:00', icon: Moon },
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SchedulesPage() {
  const [patterns, setPatterns] = useState<SchedulePattern[]>(initialPatterns)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editPattern, setEditPattern] = useState<SchedulePattern | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'fixed' as PatternType,
    workingDays: [] as number[],
    shiftId: 'morning',
    rotatingSequence: [
      { days: 2, shiftType: 'morning' as ShiftType },
      { days: 2, shiftType: 'night' as ShiftType },
      { days: 2, shiftType: 'off' as ShiftType },
    ],
    startDate: new Date().toISOString().split('T')[0],
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'fixed',
      workingDays: [],
      shiftId: 'morning',
      rotatingSequence: [
        { days: 2, shiftType: 'morning' },
        { days: 2, shiftType: 'night' },
        { days: 2, shiftType: 'off' },
      ],
      startDate: new Date().toISOString().split('T')[0],
    })
    setEditPattern(null)
  }

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort()
    }))
  }

  const handleSequenceChange = (index: number, field: 'days' | 'shiftType', value: number | ShiftType) => {
    setFormData(prev => ({
      ...prev,
      rotatingSequence: prev.rotatingSequence.map((seq, i) => 
        i === index ? { ...seq, [field]: value } : seq
      )
    }))
  }

  const addSequenceItem = () => {
    setFormData(prev => ({
      ...prev,
      rotatingSequence: [...prev.rotatingSequence, { days: 1, shiftType: 'off' as ShiftType }]
    }))
  }

  const removeSequenceItem = (index: number) => {
    if (formData.rotatingSequence.length > 2) {
      setFormData(prev => ({
        ...prev,
        rotatingSequence: prev.rotatingSequence.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a pattern name')
      return
    }

    if (formData.type === 'fixed' && formData.workingDays.length === 0) {
      toast.error('Please select at least one working day')
      return
    }

    const totalDays = formData.rotatingSequence.reduce((sum, seq) => sum + seq.days, 0)
    if (formData.type === 'rotating' && totalDays === 0) {
      toast.error('Rotating pattern must have at least one day')
      return
    }

    const newPattern: SchedulePattern = {
      id: editPattern?.id || `pattern-${Date.now()}`,
      name: formData.name,
      description: formData.description || generateDescription(),
      type: formData.type,
      workingDays: formData.type === 'fixed' ? formData.workingDays : undefined,
      shiftId: formData.type === 'fixed' ? formData.shiftId : undefined,
      rotatingPattern: formData.type === 'rotating' ? {
        sequence: formData.rotatingSequence,
        startDate: formData.startDate,
      } : undefined,
      isActive: true,
      assignedEmployees: editPattern?.assignedEmployees || 0,
    }

    if (editPattern) {
      setPatterns(prev => prev.map(p => p.id === editPattern.id ? newPattern : p))
      toast.success('Schedule pattern updated')
    } else {
      setPatterns(prev => [...prev, newPattern])
      toast.success('Schedule pattern created')
    }

    setCreateDialogOpen(false)
    resetForm()
  }

  const generateDescription = () => {
    if (formData.type === 'fixed') {
      const days = formData.workingDays.map(d => dayNames[d]).join(', ')
      const shift = shiftOptions.find(s => s.id === formData.shiftId)
      return `${days} - ${shift?.name}`
    } else {
      return formData.rotatingSequence
        .map(seq => `${seq.days}d ${seq.shiftType}`)
        .join(' > ')
    }
  }

  const openEditDialog = (pattern: SchedulePattern) => {
    setEditPattern(pattern)
    setFormData({
      name: pattern.name,
      description: pattern.description,
      type: pattern.type,
      workingDays: pattern.workingDays || [],
      shiftId: pattern.shiftId || 'morning',
      rotatingSequence: pattern.rotatingPattern?.sequence || [
        { days: 2, shiftType: 'morning' },
        { days: 2, shiftType: 'night' },
        { days: 2, shiftType: 'off' },
      ],
      startDate: pattern.rotatingPattern?.startDate || new Date().toISOString().split('T')[0],
    })
    setCreateDialogOpen(true)
  }

  const deletePattern = (id: string) => {
    const pattern = patterns.find(p => p.id === id)
    if (pattern && pattern.assignedEmployees > 0) {
      toast.error('Cannot delete pattern with assigned employees')
      return
    }
    setPatterns(prev => prev.filter(p => p.id !== id))
    toast.success('Pattern deleted')
  }

  const togglePatternActive = (id: string) => {
    setPatterns(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ))
  }

  // Calculate what shift an employee would be on for a given date based on rotating pattern
  const getShiftForDate = (pattern: SchedulePattern, date: Date): ShiftType | null => {
    if (pattern.type === 'fixed') {
      const dayOfWeek = date.getDay()
      if (pattern.workingDays?.includes(dayOfWeek)) {
        return pattern.shiftId === 'night' ? 'night' : 'morning'
      }
      return 'off'
    }

    if (pattern.type === 'rotating' && pattern.rotatingPattern) {
      const startDate = new Date(pattern.rotatingPattern.startDate)
      const diffTime = date.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      const cycleDays = pattern.rotatingPattern.sequence.reduce((sum, seq) => sum + seq.days, 0)
      const dayInCycle = ((diffDays % cycleDays) + cycleDays) % cycleDays

      let cumulative = 0
      for (const seq of pattern.rotatingPattern.sequence) {
        cumulative += seq.days
        if (dayInCycle < cumulative) {
          return seq.shiftType
        }
      }
    }
    
    return null
  }

  // Generate preview for next 14 days
  const generatePreview = (pattern: SchedulePattern) => {
    const preview = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      preview.push({
        date,
        shift: getShiftForDate(pattern, date)
      })
    }
    return preview
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <CalendarDays className="size-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
              <p className="text-muted-foreground">
                Manage fixed and rotating schedule patterns for attendance tracking
              </p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
            <Plus className="mr-2 size-4" />
            Create Pattern
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patterns</p>
                  <p className="text-2xl font-bold">{patterns.length}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <CalendarDays className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rotating Patterns</p>
                  <p className="text-2xl font-bold">
                    {patterns.filter(p => p.type === 'rotating').length}
                  </p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <RotateCcw className="size-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Employees</p>
                  <p className="text-2xl font-bold">
                    {patterns.reduce((sum, p) => sum + p.assignedEmployees, 0)}
                  </p>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <Users className="size-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pattern List */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Patterns</CardTitle>
            <CardDescription>
              Configure fixed weekly schedules or rotating patterns (e.g., 2 days morning, 2 days night, 2 days off)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Patterns</TabsTrigger>
                <TabsTrigger value="fixed">Fixed</TabsTrigger>
                <TabsTrigger value="rotating">Rotating</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <PatternList 
                  patterns={patterns} 
                  onEdit={openEditDialog} 
                  onDelete={deletePattern}
                  onToggle={togglePatternActive}
                  generatePreview={generatePreview}
                />
              </TabsContent>
              <TabsContent value="fixed">
                <PatternList 
                  patterns={patterns.filter(p => p.type === 'fixed')} 
                  onEdit={openEditDialog} 
                  onDelete={deletePattern}
                  onToggle={togglePatternActive}
                  generatePreview={generatePreview}
                />
              </TabsContent>
              <TabsContent value="rotating">
                <PatternList 
                  patterns={patterns.filter(p => p.type === 'rotating')} 
                  onEdit={openEditDialog} 
                  onDelete={deletePattern}
                  onToggle={togglePatternActive}
                  generatePreview={generatePreview}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setCreateDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editPattern ? 'Edit Schedule Pattern' : 'Create Schedule Pattern'}
            </DialogTitle>
            <DialogDescription>
              Define a fixed weekly schedule or a rotating pattern for employee attendance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Pattern Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., 2-2-2 Rotation"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Pattern Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as PatternType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Weekly</SelectItem>
                    <SelectItem value="rotating">Rotating Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this pattern"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Fixed Pattern Config */}
            {formData.type === 'fixed' && (
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h3 className="font-medium">Fixed Weekly Schedule</h3>
                
                <div className="space-y-2">
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((day, index) => (
                      <Button
                        key={day}
                        type="button"
                        variant={formData.workingDays.includes(index) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDayToggle(index)}
                        className="w-12"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shift Assignment</Label>
                  <Select 
                    value={formData.shiftId} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, shiftId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftOptions.map(shift => (
                        <SelectItem key={shift.id} value={shift.id}>
                          <span className="flex items-center gap-2">
                            <shift.icon className="size-4" />
                            {shift.name} ({shift.startTime} - {shift.endTime})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Rotating Pattern Config */}
            {formData.type === 'rotating' && (
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Rotating Pattern Sequence</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSequenceItem}
                  >
                    <Plus className="mr-1 size-3" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.rotatingSequence.map((seq, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground w-16">Step {index + 1}</span>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={14}
                          value={seq.days}
                          onChange={(e) => handleSequenceChange(index, 'days', parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>

                      <Select 
                        value={seq.shiftType} 
                        onValueChange={(v) => handleSequenceChange(index, 'shiftType', v as ShiftType)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">
                            <span className="flex items-center gap-2">
                              <Sun className="size-3 text-warning" />
                              Morning
                            </span>
                          </SelectItem>
                          <SelectItem value="night">
                            <span className="flex items-center gap-2">
                              <Moon className="size-3 text-primary" />
                              Night
                            </span>
                          </SelectItem>
                          <SelectItem value="off">
                            <span className="flex items-center gap-2">
                              <Coffee className="size-3 text-muted-foreground" />
                              Day Off
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {formData.rotatingSequence.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSequenceItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg">
                  <RotateCcw className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      Total Cycle: {formData.rotatingSequence.reduce((sum, seq) => sum + seq.days, 0)} days
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pattern repeats every {formData.rotatingSequence.reduce((sum, seq) => sum + seq.days, 0)} days
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Pattern Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    The date when this rotation cycle begins
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setCreateDialogOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editPattern ? 'Update Pattern' : 'Create Pattern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  )
}

// Pattern List Component
interface PatternListProps {
  patterns: SchedulePattern[]
  onEdit: (pattern: SchedulePattern) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  generatePreview: (pattern: SchedulePattern) => { date: Date; shift: ShiftType | null }[]
}

function PatternList({ patterns, onEdit, onDelete, onToggle, generatePreview }: PatternListProps) {
  if (patterns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarDays className="size-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No patterns found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {patterns.map(pattern => {
        const preview = generatePreview(pattern)
        return (
          <Card key={pattern.id} className={!pattern.isActive ? 'opacity-60' : ''}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{pattern.name}</h3>
                    <Badge variant={pattern.type === 'rotating' ? 'default' : 'secondary'}>
                      {pattern.type === 'rotating' ? (
                        <><RotateCcw className="size-3 mr-1" /> Rotating</>
                      ) : (
                        'Fixed'
                      )}
                    </Badge>
                    {!pattern.isActive && (
                      <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="size-4" />
                      {pattern.assignedEmployees} employees
                    </span>
                  </div>

                  {/* Schedule Preview */}
                  <div className="pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Next 14 days preview:</p>
                    <div className="flex gap-1 flex-wrap">
                      {preview.map((day, index) => {
                        const isToday = index === 0
                        return (
                          <div
                            key={index}
                            className={`
                              w-8 h-10 rounded flex flex-col items-center justify-center text-xs
                              ${day.shift === 'morning' ? 'bg-warning/20 text-warning' : ''}
                              ${day.shift === 'night' ? 'bg-primary/20 text-primary' : ''}
                              ${day.shift === 'off' ? 'bg-muted text-muted-foreground' : ''}
                              ${isToday ? 'ring-2 ring-primary' : ''}
                            `}
                            title={`${day.date.toLocaleDateString()} - ${day.shift || 'N/A'}`}
                          >
                            <span className="font-medium">
                              {day.date.getDate()}
                            </span>
                            {day.shift === 'morning' && <Sun className="size-3" />}
                            {day.shift === 'night' && <Moon className="size-3" />}
                            {day.shift === 'off' && <Coffee className="size-3" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${pattern.id}`} className="text-sm text-muted-foreground">
                      Active
                    </Label>
                    <Switch
                      id={`active-${pattern.id}`}
                      checked={pattern.isActive}
                      onCheckedChange={() => onToggle(pattern.id)}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(pattern)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(pattern.id)}
                    disabled={pattern.assignedEmployees > 0}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
