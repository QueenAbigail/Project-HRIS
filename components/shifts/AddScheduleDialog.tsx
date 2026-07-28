'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: any | null
  shifts: any[]
  onSuccess?: () => void
}

export function AddScheduleDialog({
  open,
  onOpenChange,
  schedule,
  shifts,
  onSuccess,
}: AddScheduleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [useDateRange, setUseDateRange] = useState(false)
  const [useRotationPattern, setUseRotationPattern] = useState(false)
  const [selectedDays, setSelectedDays] = useState({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false,
  })
  const [rotationPattern, setRotationPattern] = useState<Array<{ shiftId: string; days: number; isOffDay?: boolean }>>([
    { shiftId: '', days: 2 },
    { shiftId: '', days: 2 },
  ])
  const [rotationCount, setRotationCount] = useState<2 | 3 | 4>(2)
  const [rotationStartDate, setRotationStartDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [rotationDuration, setRotationDuration] = useState(30)
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    shiftId: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })
  const [editReason, setEditReason] = useState('')
  const [isEditingPast, setIsEditingPast] = useState(false)
  const [employeesLoaded, setEmployeesLoaded] = useState(false)

  useEffect(() => {
    if (open && schedule) {
      // In edit mode, load the single schedule data
      const scheduleDate = schedule.scheduleDate?.split('T')[0] || ''
      const today = new Date().toISOString().split('T')[0]
      const isPast = scheduleDate < today
      
      setFormData({
        employeeId: schedule.employeeId,
        employeeName: schedule.employeeName,
        shiftId: schedule.shiftId,
        scheduleDate: scheduleDate,
        startDate: scheduleDate,
        endDate: scheduleDate,
      })
      setIsEditingPast(isPast)
      setEditReason('')
      // Allow switching between modes in edit
      setUseDateRange(false)
      setUseRotationPattern(false)
    } else if (open) {
      // In create mode, reset to defaults
      setUseDateRange(false)
      setUseRotationPattern(false)
      setIsEditingPast(false)
      setEditReason('')
      setFormData({
        employeeId: '',
        employeeName: '',
        shiftId: '',
        scheduleDate: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }
  }, [open, schedule])

  useEffect(() => {
    // Load employees list
    const loadEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        if (response.ok) {
          const data = await response.json()
          setEmployees(data || [])
        }
      } catch (error) {
        console.error('Error loading employees:', error)
      }
    }
    
    if (open) {
      loadEmployees()
    }
  }, [open])

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees
    const query = employeeSearch.toLowerCase()
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(query) ||
        emp.id?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query)
    )
  }, [employeeSearch, employees])

  const generateDateRange = (): Date[] => {
    const dates: Date[] = []
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay()
      const dayMap: Record<number, keyof typeof selectedDays> = {
        0: 'sun',
        1: 'mon',
        2: 'tue',
        3: 'wed',
        4: 'thu',
        5: 'fri',
        6: 'sat',
      }

      if (selectedDays[dayMap[dayOfWeek]]) {
        dates.push(new Date(d))
      }
    }

    return dates
  }

  const updateRotationCount = (count: 2 | 3 | 4) => {
    setRotationCount(count)
    if (count > rotationPattern.length) {
      // Add new pattern slots
      const newPatterns = [...rotationPattern]
      while (newPatterns.length < count) {
        newPatterns.push({ shiftId: '', days: 2 })
      }
      setRotationPattern(newPatterns)
    } else if (count < rotationPattern.length) {
      // Remove excess pattern slots
      setRotationPattern(rotationPattern.slice(0, count))
    }
  }

  const generateRotationSchedules = (): Array<{ date: string; shiftId: string | null }> => {
    const schedules: Array<{ date: string; shiftId: string | null }> = []
    const start = new Date(rotationStartDate)
    const end = new Date(start.getTime() + rotationDuration * 24 * 60 * 60 * 1000)
    
    console.log('[v0] Rotation schedule generation:', {
      start: rotationStartDate,
      end: end.toISOString(),
      duration: rotationDuration,
      patterns: rotationPattern.length,
    })
    
    let currentDay = 0
    let patternIndex = 0
    let d = new Date(start)
    
    while (d <= end && schedules.length < 365) { // Safety limit
      const pattern = rotationPattern[patternIndex]
      if (!pattern) break
      
      // If it's an off day, use null for shiftId (will be handled in bulk create)
      if (pattern.isOffDay) {
        schedules.push({
          date: d.toISOString().split('T')[0],
          shiftId: null,
        })
      } else if (pattern.shiftId) {
        schedules.push({
          date: d.toISOString().split('T')[0],
          shiftId: pattern.shiftId,
        })
      } else {
        console.warn('[v0] Rotation pattern missing shift and not off day:', pattern)
        break // Skip if shift not selected and not an off day
      }
      
      currentDay++
      d.setDate(d.getDate() + 1)
      
      // Move to next shift in pattern when days are complete
      if (currentDay >= pattern.days) {
        currentDay = 0
        patternIndex = (patternIndex + 1) % rotationPattern.length
      }
    }
    
    console.log('[v0] Generated schedules count:', schedules.length)
    return schedules
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId) {
      toast.error('Please select an employee')
      return
    }

    // Validate past schedule edit reason
    if (schedule && isEditingPast && !editReason.trim()) {
      toast.error('Please provide a reason for editing this past schedule')
      return
    }

    if (useRotationPattern) {
      // Validate rotation pattern
      if (rotationPattern.some(p => (!p.isOffDay && !p.shiftId) || p.days < 1)) {
        toast.error('Please complete the rotation pattern (either select a shift or mark as day off)')
        return
      }

      const rotationSchedules = generateRotationSchedules()
      console.log('[v0] Generated rotation schedules:', rotationSchedules.length, rotationSchedules.slice(0, 3))
      
      if (rotationSchedules.length === 0) {
        toast.error('No schedules generated from pattern')
        return
      }

      try {
        setLoading(true)

        const schedulesToCreate = rotationSchedules.map(s => ({
          employeeId: formData.employeeId,
          shiftId: s.shiftId,
          scheduleDate: s.date,
        }))

        console.log('[v0] Schedules to create:', schedulesToCreate.length, schedulesToCreate.slice(0, 3))

        const response = await fetch('/api/schedules/bulk-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            schedules: schedulesToCreate,
            replace: !!schedule,
            employeeId: formData.employeeId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('[v0] Bulk create error:', errorData)
          throw new Error(errorData.error || 'Failed to create schedules')
        }
        
        const result = await response.json()
        console.log('[v0] Bulk create result:', result)
        
        if (result.created === 0 && result.errors) {
          console.error('[v0] All schedules failed:', result.errors)
          toast.error(`Failed: ${result.errors[0]}`)
          return
        }
        
        toast.success(`Created ${result.created} schedules with rotation pattern`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save schedules')
      } finally {
        setLoading(false)
        onSuccess?.()
        onOpenChange(false)
        resetForm()
      }
    } else if (useDateRange) {
      if (!formData.shiftId) {
        toast.error('Please select a shift')
        return
      }

      if (!formData.startDate || !formData.endDate) {
        toast.error('Please select date range')
        return
      }

      try {
        setLoading(true)

        const dates = generateDateRange()
        if (dates.length === 0) {
          toast.error('No dates match the selected days')
          return
        }

        const schedulesToCreate = dates.map(date => ({
          employeeId: formData.employeeId,
          shiftId: formData.shiftId,
          scheduleDate: date.toISOString().split('T')[0],
        }))

        const response = await fetch('/api/schedules/bulk-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            schedules: schedulesToCreate,
            replace: !!schedule,
            employeeId: formData.employeeId,
          }),
        })

        if (!response.ok) throw new Error('Failed to create schedules')
        const result = await response.json()
        toast.success(`Created ${result.created} schedules`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save schedules')
      } finally {
        setLoading(false)
        onSuccess?.()
        onOpenChange(false)
        resetForm()
      }
    } else {
      // Single schedule
      if (!formData.shiftId || !formData.scheduleDate) {
        toast.error('Please fill in all fields')
        return
      }

      try {
        setLoading(true)

        if (schedule) {
          // Edit single schedule
          const response = await fetch(`/api/schedules/${schedule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: formData.employeeId,
              shiftId: formData.shiftId,
              scheduleDate: formData.scheduleDate,
            }),
          })

          if (!response.ok) throw new Error('Failed to update schedule')
          toast.success('Schedule updated')
        } else {
          // Create single schedule
          const response = await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: formData.employeeId,
              shiftId: formData.shiftId,
              scheduleDate: formData.scheduleDate,
            }),
          })

          if (!response.ok) throw new Error('Failed to create schedule')
          toast.success('Schedule created')
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save schedule')
      } finally {
        setLoading(false)
        onSuccess?.()
        onOpenChange(false)
        resetForm()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      shiftId: '',
      scheduleDate: new Date().toISOString().split('T')[0],
    })
    setEmployeeSearch('')
    setComboboxOpen(false)
  }

  const handleEmployeeSelect = (employee: any) => {
    setFormData({
      ...formData,
      employeeId: employee.id,
      employeeName: employee.name,
    })
    setEmployeeSearch('')
    setComboboxOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto !max-w-6xl w-screen">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Schedule' : 'Add Manual Schedule'}</DialogTitle>
          <DialogDescription>
            {schedule ? 'Update the schedule details' : 'Create a new schedule for an employee'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select Employee *</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between h-10 px-3 bg-background hover:bg-muted/50"
                >
                  <span className={cn('truncate', !formData.employeeId && 'text-muted-foreground')}>
                    {formData.employeeId
                      ? (() => {
                          const emp = employees.find((e) => e.id === formData.employeeId)
                          return emp ? `${emp.employeeCode || emp.id} - ${emp.name}` : 'Select employee...'
                        })()
                      : 'Search by employee ID or name...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search by ID or name..."
                    value={employeeSearch}
                    onValueChange={setEmployeeSearch}
                    className="border-none focus:ring-0"
                  />
                  <CommandList className="max-h-[280px]">
                    <CommandEmpty className="py-6 text-center text-xs">No employee found</CommandEmpty>
                    <CommandGroup>
                      {filteredEmployees.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={`${employee.employeeCode || employee.id} ${employee.name}`}
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              employeeId: employee.id,
                              employeeName: employee.name,
                            }))
                            setComboboxOpen(false)
                            setEmployeeSearch('')
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.employeeId === employee.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col gap-1 flex-1">
                            <span className="text-sm font-medium">{employee.employeeCode || employee.id} - {employee.name}</span>
                            <span className="text-xs text-muted-foreground">{employee.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRange"
                  checked={useDateRange}
                  onCheckedChange={(checked) => {
                    setUseDateRange(checked as boolean)
                    if (checked) setUseRotationPattern(false)
                  }}
                  disabled={useRotationPattern}
                />
                <Label htmlFor="useRange" className="font-normal cursor-pointer">
                  Date range
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRotation"
                  checked={useRotationPattern}
                  onCheckedChange={(checked) => {
                    setUseRotationPattern(checked as boolean)
                    if (checked) setUseDateRange(false)
                  }}
                  disabled={useDateRange}
                />
                <Label htmlFor="useRotation" className="font-normal cursor-pointer">
                  Rotation pattern
                </Label>
              </div>
            </div>

            {useRotationPattern ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rotationStart">Start Date</Label>
                  <Input
                    id="rotationStart"
                    type="date"
                    value={rotationStartDate}
                    onChange={(e) => setRotationStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotationDays">Duration (days)</Label>
                  <Input
                    id="rotationDays"
                    type="number"
                    min="1"
                    max="365"
                    value={rotationDuration}
                    onChange={(e) => setRotationDuration(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Rotation Pattern</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={rotationCount === 2 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateRotationCount(2)}
                      >
                        2 Rotations
                      </Button>
                      <Button
                        type="button"
                        variant={rotationCount === 3 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateRotationCount(3)}
                      >
                        3 Rotations
                      </Button>
                      <Button
                        type="button"
                        variant={rotationCount === 4 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateRotationCount(4)}
                      >
                        4 Rotations
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md overflow-x-auto">
                    <div className="grid gap-3 min-w-full" style={{ gridTemplateColumns: `repeat(${rotationCount}, minmax(150px, 1fr))` }}>
                      {rotationPattern.map((pattern, idx) => (
                        <div key={idx} className="bg-background p-2.5 rounded border border-border space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs font-medium">R{idx + 1}</Label>
                          <div className="flex items-center space-x-1.5">
                            <Checkbox
                              id={`offday-${idx}`}
                              checked={pattern.isOffDay || false}
                              onCheckedChange={(checked) => {
                                const newPattern = [...rotationPattern]
                                newPattern[idx].isOffDay = checked as boolean
                                if (checked) newPattern[idx].shiftId = ''
                                setRotationPattern(newPattern)
                              }}
                            />
                            <Label htmlFor={`offday-${idx}`} className="text-xs cursor-pointer">
                              Off
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {!pattern.isOffDay ? (
                            <Select
                              value={pattern.shiftId}
                              onValueChange={(value) => {
                                const newPattern = [...rotationPattern]
                                newPattern[idx].shiftId = value
                                setRotationPattern(newPattern)
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Shift..." />
                              </SelectTrigger>
                              <SelectContent>
                                {shifts.map(shift => (
                                  <SelectItem key={shift.id} value={shift.id}>
                                    {shift.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="text-xs text-muted-foreground p-1.5 bg-muted rounded">
                              Day Off
                            </div>
                          )}
                          <div>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              value={pattern.days}
                              onChange={(e) => {
                                const newPattern = [...rotationPattern]
                                newPattern[idx].days = parseInt(e.target.value)
                                setRotationPattern(newPattern)
                              }}
                              className="h-7 text-xs p-1"
                              placeholder="Days"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              </>
            ) : useDateRange ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Days</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(selectedDays).map(([day, checked]) => (
                      <div key={day} className="flex items-center">
                        <Checkbox
                          id={day}
                          checked={checked}
                          onCheckedChange={(value) =>
                            setSelectedDays({
                              ...selectedDays,
                              [day]: value,
                            })
                          }
                        />
                        <label
                          htmlFor={day}
                          className="ml-1 text-xs cursor-pointer font-medium uppercase"
                        >
                          {day.substring(0, 1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduleDate: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          {!useRotationPattern && (
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <Select value={formData.shiftId} onValueChange={(value) =>
                setFormData({ ...formData, shiftId: value })
              }>
                <SelectTrigger id="shift">
                  <SelectValue placeholder="Select shift..." />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map(shift => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {schedule && isEditingPast && (
            <div className="space-y-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md">
              <Label className="text-sm font-semibold">Reason for edit (past schedule)*</Label>
              <p className="text-xs text-muted-foreground">This schedule is in the past. Please provide a reason for this change:</p>
              <Input
                placeholder="e.g., Correction for missed shift, Staff swap approval, etc."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (schedule && isEditingPast && !editReason.trim())}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {schedule ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
