'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    shiftId: '',
    scheduleDate: new Date().toISOString().split('T')[0],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.shiftId || !formData.scheduleDate) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const url = schedule ? `/api/schedules/${schedule.id}` : '/api/schedules'
      const method = schedule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save schedule')
      }

      toast.success(schedule ? 'Schedule updated' : 'Schedule created')
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
