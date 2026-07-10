'use client'

import { useState, useEffect } from 'react'
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
  AlertTriangle,
  Settings,
  Sunset,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  formatTime,
  getShiftEmployees,
  getShiftStats,
} from '@/lib/data'
import { ShiftFormDialog } from '@/components/shifts/ShiftFormDialog'
import { EmployeeAssignmentTable } from '@/components/shifts/EmployeeAssignmentTable'
import { getShifts, getEmployeeSchedules } from '@/app/superadmin/actions'

// Schedule pattern types
type PatternType = 'fixed' | 'rotating' | 'modulo'
type ShiftType = 'morning' | 'night' | 'off'

// Constants for shift icons and options
const shiftIcons: Record<string, React.ComponentType<any>> = {
  'morning': Sun,
  'night': Moon,
  'off': Coffee,
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const shiftOptions = [
  { id: 'morning', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', icon: Sun },
  { id: 'night', name: 'Night Shift', startTime: '14:00', endTime: '22:00', icon: Moon },
  { id: 'off', name: 'Off', startTime: '', endTime: '', icon: Coffee },
]

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
  // For modulo patterns (e.g., 2222, 222, or custom sequences)
  moduloPattern?: {
    sequence: ShiftType[] // Each element represents one day in the cycle (e.g., ['morning', 'morning', 'night', 'night'] for 2-2)
    startDate: string
  }
  isActive: boolean
  assignedEmployees: number
}

// Mock data for schedule patterns - REMOVED, now fetching from database
// const initialPatterns: SchedulePattern[] = [...]

export default function SchedulePatternsPage() {
  const [patterns, setPatterns] = useState<SchedulePattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editPattern, setEditPattern] = useState<SchedulePattern | null>(null)
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)
  const [activeMainTab, setActiveMainTab] = useState('patterns')
  const [createShiftOpen, setCreateShiftOpen] = useState(false)
  const [editShiftOpen, setEditShiftOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<typeof shifts[0] | null>(null)

  // Initialize shifts from database
  const initializeShifts = useSchedulesStore(state => state.initializeShifts)
  const initializeEmployeeSchedules = useSchedulesStore(state => state.initializeEmployeeSchedules)
  
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const shiftsData = await getShifts()
        initializeShifts(shiftsData)
      } catch (err) {
        console.error('[v0] Error loading shifts:', err)
        initializeShifts([])
      }
    }
    loadShifts()
  }, [initializeShifts])

  // Load employee schedules from database
  useEffect(() => {
    const loadEmployeeSchedules = async () => {
      try {
        const schedulesData = await getEmployeeSchedules()
        initializeEmployeeSchedules(schedulesData)
      } catch (err) {
        console.error('[v0] Error loading employee schedules:', err)
        initializeEmployeeSchedules([])
      }
    }
    loadEmployeeSchedules()
  }, [initializeEmployeeSchedules])

  // Fetch patterns from database on component mount
  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/schedule-patterns')
        if (!response.ok) {
          throw new Error('Failed to fetch patterns')
        }
        const data = await response.json()
        // Transform database data to match the interface
        const transformedData = data.map((p: any) => ({
          ...p,
          type: (p.type as string).toLowerCase() as PatternType,
          workingDays: p.workingDays ? JSON.parse(p.workingDays) : undefined,
          rotatingPattern: p.rotatingPattern ? JSON.parse(p.rotatingPattern) : undefined,
          moduloPattern: p.moduloPattern ? JSON.parse(p.moduloPattern) : undefined,
        }))
        setPatterns(transformedData)
      } catch (err) {
        console.error('[v0] Error fetching patterns:', err)
        setError('Failed to load patterns')
        toast.error('Failed to load patterns')
      } finally {
        setLoading(false)
      }
    }

    fetchPatterns()
  }, [])

  // Get shifts from store
  const shifts = useSchedulesStore(state => state.shifts)

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
    moduloSequence: ['morning', 'morning', 'night', 'night'] as ShiftType[],
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
      moduloSequence: ['morning', 'morning', 'night', 'night'],
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

  const handleModuloSequenceChange = (index: number, value: ShiftType) => {
    setFormData(prev => ({
      ...prev,
      moduloSequence: prev.moduloSequence.map((shift, i) => i === index ? value : shift)
    }))
  }

  const addModuloDay = () => {
    setFormData(prev => ({
      ...prev,
      moduloSequence: [...prev.moduloSequence, 'off' as ShiftType]
    }))
  }

  const removeModuloDay = (index: number) => {
    if (formData.moduloSequence.length > 1) {
      setFormData(prev => ({
        ...prev,
        moduloSequence: prev.moduloSequence.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async () => {
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

    if (formData.type === 'modulo' && formData.moduloSequence.length === 0) {
      toast.error('Modulo pattern must have at least one day')
      return
    }

    // Convert type to uppercase for API
    const typeMap: { [key: string]: string } = {
      'fixed': 'FIXED',
      'rotating': 'ROTATING',
      'modulo': 'MODULO'
    }

    const newPattern = {
      id: editPattern?.id,
      name: formData.name,
      description: formData.description || generateDescription(),
      type: typeMap[formData.type],
      workingDays: formData.type === 'fixed' ? formData.workingDays : undefined,
      shiftId: formData.type === 'fixed' ? formData.shiftId : undefined,
      rotatingPattern: formData.type === 'rotating' ? {
        sequence: formData.rotatingSequence,
        startDate: formData.startDate,
      } : undefined,
      moduloPattern: formData.type === 'modulo' ? {
        sequence: formData.moduloSequence,
        startDate: formData.startDate,
      } : undefined,
      isActive: true,
      assignedEmployees: editPattern?.assignedEmployees || 0,
    }

    try {
      const method = editPattern ? 'PUT' : 'POST'
      const response = await fetch('/api/schedule-patterns', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPattern),
      })

      if (!response.ok) {
        throw new Error('Failed to save pattern')
      }

      const savedPattern = await response.json()

      // Transform the response data
      const transformedPattern = {
        ...savedPattern,
        type: (savedPattern.type as string).toLowerCase() as PatternType,
        workingDays: savedPattern.workingDays ? JSON.parse(savedPattern.workingDays) : undefined,
        rotatingPattern: savedPattern.rotatingPattern ? JSON.parse(savedPattern.rotatingPattern) : undefined,
        moduloPattern: savedPattern.moduloPattern ? JSON.parse(savedPattern.moduloPattern) : undefined,
      }

      if (editPattern) {
        setPatterns(prev => prev.map(p => p.id === editPattern.id ? transformedPattern : p))
        toast.success('Schedule pattern updated')
      } else {
        setPatterns(prev => [...prev, transformedPattern])
        toast.success('Schedule pattern created')
      }

      setCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('[v0] Error saving pattern:', error)
      toast.error('Failed to save pattern')
    }
  }

  const generateDescription = () => {
    if (formData.type === 'fixed') {
      const days = formData.workingDays.map(d => dayNames[d]).join(', ')
      const shift = shiftOptions.find(s => s.id === formData.shiftId)
      return `${days} - ${shift?.name}`
    } else if (formData.type === 'modulo') {
      const pattern = formData.moduloSequence
        .map((shift, i) => {
          const first = formData.moduloSequence[i]
          const count = formData.moduloSequence.slice(i).findIndex(s => s !== first) + 1
          return count > 1 ? `${count}${shift[0].toUpperCase()}` : shift[0].toUpperCase()
        })
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join('-')
      return `Modulo: ${pattern}`
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
      moduloSequence: pattern.moduloPattern?.sequence || ['morning', 'morning', 'night', 'night'],
      startDate: pattern.rotatingPattern?.startDate || pattern.moduloPattern?.startDate || new Date().toISOString().split('T')[0],
    })
    setCreateDialogOpen(true)
  }

  const deletePattern = async (id: string) => {
    try {
      const response = await fetch(`/api/schedule-patterns?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete pattern')
      }

      setPatterns(prev => prev.filter(p => p.id !== id))
      toast.success('Schedule pattern deleted')
    } catch (error) {
      console.error('[v0] Error deleting pattern:', error)
      toast.error('Failed to delete pattern')
    }
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

    if (pattern.type === 'modulo' && pattern.moduloPattern) {
      const startDate = new Date(pattern.moduloPattern.startDate)
      const diffTime = date.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      const cycleLength = pattern.moduloPattern.sequence.length
      const dayInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength

      return pattern.moduloPattern.sequence[dayInCycle]
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
                Manage shifts, assignments, and rotating schedule patterns
              </p>
            </div>
          </div>
        </div>

        {/* Main Management Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shifts">
              <Clock className="mr-2 size-4" />
              Shifts
            </TabsTrigger>
            <TabsTrigger value="import">
              <Download className="mr-2 size-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Users className="mr-2 size-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 size-4" />
                Create Pattern
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <p className="text-sm text-muted-foreground">Fixed Patterns</p>
                      <p className="text-2xl font-bold">
                        {patterns.filter(p => p.type === 'fixed').length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue/10 p-3">
                      <Clock className="size-6 text-blue-600" />
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
                      <p className="text-sm text-muted-foreground">Modulo Patterns</p>
                      <p className="text-2xl font-bold">
                        {patterns.filter(p => p.type === 'modulo').length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-success/10 p-3">
                      <RotateCcw className="size-6 text-success" />
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
                    <TabsTrigger value="modulo">Modulo</TabsTrigger>
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
                  <TabsContent value="modulo">
                    <PatternList
                      patterns={patterns.filter(p => p.type === 'modulo')}
                      onEdit={openEditDialog}
                      onDelete={deletePattern}
                      onToggle={togglePatternActive}
                      generatePreview={generatePreview}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shifts Tab */}
          <TabsContent value="shifts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Shift Configuration</h2>
                <p className="text-sm text-muted-foreground">Manage shift times, grace periods, and attendance rules</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 size-4" />
                  Export CSV
                </Button>
                <Button onClick={() => setCreateShiftOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Create Shift
                </Button>
              </div>
            </div>

            {/* Late Check-ins Alert */}
            {/* Shift Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shifts.map((shift) => {
                const stats = getShiftStats(shift.id)
                const ShiftIcon = shiftIcons[shift.id as keyof typeof shiftIcons] || Clock
                const hasLate = stats.late > 0

                return (
                  <Card
                    key={shift.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${hasLate ? 'ring-1 ring-warning/50' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShiftIcon className="size-4 text-primary" />
                          </div>
                          <CardTitle className="text-base">{shift.name}</CardTitle>
                        </div>
                        {hasLate && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                            {stats.late} late
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-mono">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Grace</span>
                          <span>{shift.gracePeriodMinutes} min</span>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {stats.total} assigned
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-success">{stats.present}</span>
                              <span className="text-warning">{stats.late}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Active Shifts List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Shifts</CardTitle>
                <CardDescription>Configure shift times and grace periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shifts.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="size-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No shifts configured. Create a shift to get started.</p>
                  </div>
                ) : (
                  shifts.map(shift => (
                  <div key={shift.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {(() => {
                          const ShiftIcon = (shiftIcons as Record<string, any>)[shift.id] || Clock
                          return <ShiftIcon className="size-5 text-primary" />
                        })()}
                      </div>
                      <div>
                        <h4 className="font-medium">{shift.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)} | {shift.gracePeriodMinutes}min grace
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingShift(shift)
                        setEditShiftOpen(true)
                      }}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  ))
                )}
              </CardContent>
            </Card>

            <ShiftFormDialog
              open={createShiftOpen}
              onOpenChange={setCreateShiftOpen}
            />

            <ShiftFormDialog
              shift={editingShift || undefined}
              open={editShiftOpen}
              onOpenChange={(open) => {
                setEditShiftOpen(open)
                if (!open) setEditingShift(null)
              }}
            />
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <EmployeeAssignmentTable />
          </TabsContent>

          {/* Swaps Tab */}

        </Tabs>
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
                    <SelectItem value="modulo">Modulo Pattern (2-2-2, etc.)</SelectItem>
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
                          {shifts.map(shift => (
                            <SelectItem key={shift.id} value={shift.id}>
                              <span className="flex items-center gap-2">
                                {(() => {
                                  const ShiftIcon = (shiftIcons as Record<string, any>)[shift.id] || Clock
                                  return <ShiftIcon className="size-3" />
                                })()}
                                {shift.name}
                              </span>
                            </SelectItem>
                          ))}
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

              </div>
            )}

            {/* Modulo Pattern Config */}
            {formData.type === 'modulo' && (
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Modulo Pattern (e.g., 2-2-2, 2-2-2-2)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addModuloDay}
                  >
                    <Plus className="mr-1 size-3" />
                    Add Day
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Define a repeating daily pattern. Each day cycles through in order (e.g., 2 mornings, 2 nights, 2 days off).
                </p>

                <div className="space-y-3">
                  {formData.moduloSequence.map((shift, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-muted-foreground w-16">Day {index + 1}</span>

                      <Select
                        value={shift}
                        onValueChange={(v) => handleModuloSequenceChange(index, v as ShiftType)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map(shiftItem => (
                            <SelectItem key={shiftItem.id} value={shiftItem.id}>
                              <span className="flex items-center gap-2">
                                {(() => {
                                  const ShiftIcon = (shiftIcons as Record<string, any>)[shiftItem.id] || Clock
                                  return <ShiftIcon className="size-3" />
                                })()}
                                {shiftItem.name}
                              </span>
                            </SelectItem>
                          ))}
                          <SelectItem value="off">
                            <span className="flex items-center gap-2">
                              <Coffee className="size-3 text-muted-foreground" />
                              Day Off
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {formData.moduloSequence.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeModuloDay(index)}
                          className="text-destructive hover:text-destructive ml-auto"
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
                      Cycle Length: {formData.moduloSequence.length} days
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pattern: {formData.moduloSequence.map(s => s[0].toUpperCase()).join('-')}
                    </p>
                  </div>
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
                    <Badge variant={pattern.type === 'rotating' ? 'default' : pattern.type === 'modulo' ? 'default' : 'secondary'}>
                      {pattern.type === 'rotating' ? (
                        <><RotateCcw className="size-3 mr-1" /> Rotating</>
                      ) : pattern.type === 'modulo' ? (
                        <><RotateCcw className="size-3 mr-1" /> Modulo</>
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
