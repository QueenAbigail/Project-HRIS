'use client'

import { useState, useEffect } from 'react'
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
  const [showEmployeeList, setShowEmployeeList] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
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
  const [rotationPattern, setRotationPattern] = useState<Array<{ shiftId: string; days: number }>>([
    { shiftId: '', days: 2 },
    { shiftId: '', days: 2 },
    { shiftId: '', days: 2 },
    { shiftId: '', days: 2 },
  ])
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

  useEffect(() => {
    if (open && schedule) {
      setFormData({
        employeeId: schedule.employeeId,
        employeeName: schedule.employeeName,
        shiftId: schedule.shiftId,
        scheduleDate: schedule.scheduleDate,
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

  const filteredEmployees = employees.filter(
    emp =>
      emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.id?.toLowerCase().includes(employeeSearch.toLowerCase())
  )

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

  const generateRotationSchedules = (): Array<{ date: string; shiftId: string }> => {
    const schedules: Array<{ date: string; shiftId: string }> = []
    const start = new Date(rotationStartDate)
    const end = new Date(start.getTime() + rotationDuration * 24 * 60 * 60 * 1000)
    
    let currentDay = 0
    let patternIndex = 0
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const pattern = rotationPattern[patternIndex]
      if (!pattern || !pattern.shiftId) break
      
      schedules.push({
        date: d.toISOString().split('T')[0],
        shiftId: pattern.shiftId,
      })
      
      currentDay++
      
      // Move to next shift in pattern when days are complete
      if (currentDay >= pattern.days) {
        currentDay = 0
        patternIndex = (patternIndex + 1) % rotationPattern.length
      }
    }
    
    return schedules
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId) {
      toast.error('Please select an employee')
      return
    }

    if (useRotationPattern) {
      // Validate rotation pattern
      if (rotationPattern.some(p => !p.shiftId || p.days < 1)) {
        toast.error('Please complete the rotation pattern')
        return
      }

      const rotationSchedules = generateRotationSchedules()
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

        const response = await fetch('/api/schedules/bulk-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedules: schedulesToCreate }),
        })

        if (!response.ok) throw new Error('Failed to create schedules')
        const result = await response.json()
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
          body: JSON.stringify({ schedules: schedulesToCreate }),
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
    setShowEmployeeList(false)
  }

  const handleEmployeeSelect = (employee: any) => {
    setFormData({
      ...formData,
      employeeId: employee.id,
      employeeName: employee.name,
    })
    setEmployeeSearch('')
    setShowEmployeeList(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Schedule' : 'Add Manual Schedule'}</DialogTitle>
          <DialogDescription>
            {schedule ? 'Update the schedule details' : 'Create a new schedule for an employee'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <div className="relative">
              <Input
                id="employee"
                placeholder="Search by employee ID or name..."
                value={employeeSearch}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value)
                  setShowEmployeeList(true)
                }}
                onFocus={() => setShowEmployeeList(true)}
              />
              {showEmployeeList && filteredEmployees.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          employeeId: emp.id,
                          employeeName: emp.name,
                        })
                        setEmployeeSearch('')
                        setShowEmployeeList(false)
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted border-b border-border last:border-0 transition-colors"
                    >
                      <div className="font-medium">{emp.id} - {emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.email}</div>
                    </button>
                  ))}
                </div>
              )}
              {showEmployeeList && filteredEmployees.length === 0 && employeeSearch && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-3 text-center text-sm text-muted-foreground">
                  No employee found.
                </div>
              )}
            </div>
            {formData.employeeId && (
              <div className="text-xs text-muted-foreground mt-1">
                Selected: {formData.employeeId} - {formData.employeeName}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRange"
                  checked={useDateRange && !useRotationPattern}
                  onCheckedChange={(checked) => {
                    setUseDateRange(checked as boolean)
                    setUseRotationPattern(false)
                  }}
                  disabled={!!schedule || useRotationPattern}
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
                    setUseDateRange(false)
                  }}
                  disabled={!!schedule}
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
                  <Label>Rotation Pattern</Label>
                  <div className="bg-muted p-3 rounded-md space-y-3">
                    {rotationPattern.map((pattern, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Shift {idx + 1}</Label>
                          <Select
                            value={pattern.shiftId}
                            onValueChange={(value) => {
                              const newPattern = [...rotationPattern]
                              newPattern[idx].shiftId = value
                              setRotationPattern(newPattern)
                            }}
                          >
                            <SelectTrigger>
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
                        <div className="w-16">
                          <Label className="text-xs text-muted-foreground">Days</Label>
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
                          />
                        </div>
                      </div>
                    ))}
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
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {schedule ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
