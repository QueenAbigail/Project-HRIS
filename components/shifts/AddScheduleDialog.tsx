'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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
  const [useDateRange, setUseDateRange] = useState(false)
  const [selectedDays, setSelectedDays] = useState({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false,
  })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.shiftId) {
      toast.error('Please fill in all fields')
      return
    }

    if (useDateRange && !formData.startDate && !formData.endDate) {
      toast.error('Please select date range')
      return
    }

    if (!useDateRange && !formData.scheduleDate) {
      toast.error('Please select a date')
      return
    }

    try {
      setLoading(true)

      if (schedule && !useDateRange) {
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
      } else if (useDateRange) {
        // Create multiple schedules for date range
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

      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save schedule')
    } finally {
      setLoading(false)
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
                placeholder="Search employee..."
                value={employeeSearch || formData.employeeName}
                onChange={(e) => {
                  setEmployeeSearch(e.target.value)
                  setShowEmployeeList(true)
                }}
                onFocus={() => setShowEmployeeList(true)}
              />
              {showEmployeeList && filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredEmployees.slice(0, 10).map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleEmployeeSelect(emp)}
                      className="w-full text-left px-3 py-2 hover:bg-muted"
                    >
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-sm text-muted-foreground">{emp.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useRange"
                checked={useDateRange}
                onCheckedChange={(checked) => setUseDateRange(checked as boolean)}
                disabled={!!schedule}
              />
              <Label htmlFor="useRange" className="font-normal cursor-pointer">
                Apply to date range (multiple days)
              </Label>
            </div>

            {useDateRange ? (
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
