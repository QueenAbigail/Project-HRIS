'use client'

import { useState, useEffect } from 'react'
import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { assignEmployeeShift } from '@/app/superadmin/actions'
import { getEmployeeSchedules } from '@/app/superadmin/actions'

interface AddAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: any[]
}

export function AddAssignmentDialog({
  open,
  onOpenChange,
  employees,
}: AddAssignmentDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loading, setLoading] = useState(false)
  
  const shifts = useSchedulesStore(state => state.shifts)
  const initializeEmployeeSchedules = useSchedulesStore(state => state.initializeEmployeeSchedules)

  // Get available locations from existing assignments
  const locations = [
    { id: 'hq', name: 'Headquarters' },
    { id: 'branch1', name: 'Branch 1' },
    { id: 'branch2', name: 'Branch 2' },
  ]

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedShift || !selectedLocation) {
      toast.error('Please fill all fields')
      return
    }

    try {
      setLoading(true)
      
      // Call server action to assign employee shift
      await assignEmployeeShift(
        selectedEmployee,
        selectedShift,
        selectedLocation as any,
        [0, 1, 2, 3, 4] // Default: Monday to Friday
      )

      // Reload employee schedules from database
      const updatedSchedules = await getEmployeeSchedules()
      initializeEmployeeSchedules(updatedSchedules)

      toast.success('Employee shift assigned successfully')
      setSelectedEmployee('')
      setSelectedShift('')
      setSelectedLocation('')
      onOpenChange(false)
    } catch (error) {
      console.error('[v0] Error assigning shift:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign shift'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Filter out employees that already have assignments
  const assignedEmployeeIds = employees.map(e => e.employeeId)
  const availableEmployees = employees.filter(e => !assignedEmployeeIds.includes(e.employeeId) || !e.shiftName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Employee Shift Assignment</DialogTitle>
          <DialogDescription>
            Assign a shift and location to an employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.employeeId} value={employee.employeeId}>
                    {employee.employeeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shift Selection */}
          <div className="space-y-2">
            <Label htmlFor="shift">Shift</Label>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger id="shift">
                <SelectValue placeholder="Select a shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Shift'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
