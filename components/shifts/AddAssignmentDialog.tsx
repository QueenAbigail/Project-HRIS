'use client'

import { useState } from 'react'
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
import { assignPatternToEmployee, getEmployeePatterns } from '@/app/superadmin/actions'

interface AddAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: any[]
  patterns?: any[]
}

export function AddAssignmentDialog({
  open,
  onOpenChange,
  employees,
  patterns = [],
}: AddAssignmentDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedPattern, setSelectedPattern] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAssign = async () => {
    if (!selectedEmployee || !selectedPattern) {
      toast.error('Please select both employee and pattern')
      return
    }

    try {
      setLoading(true)
      
      // Call server action to assign pattern to employee
      await assignPatternToEmployee(selectedEmployee, selectedPattern)

      toast.success('Pattern assigned successfully to employee')
      setSelectedEmployee('')
      setSelectedPattern('')
      onOpenChange(false)
      
      // Reload patterns
      await getEmployeePatterns()
    } catch (error) {
      console.error('[v0] Error assigning pattern:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign pattern'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Shift Pattern to Employee</DialogTitle>
          <DialogDescription>
            Select an employee and assign them a shift pattern. The pattern defines their daily shift schedule.
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

          {/* Pattern Selection */}
          <div className="space-y-2">
            <Label htmlFor="pattern">Shift Pattern</Label>
            <Select value={selectedPattern} onValueChange={setSelectedPattern}>
              <SelectTrigger id="pattern">
                <SelectValue placeholder="Select a pattern" />
              </SelectTrigger>
              <SelectContent>
                {patterns && patterns.length > 0 ? (
                  patterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name} ({pattern.type})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_" disabled>
                    No patterns available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            The selected pattern will define the employee&apos;s shift schedule based on the pattern rules (daily shift assignments, working days, etc.)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedEmployee || !selectedPattern}>
            {loading ? 'Assigning...' : 'Assign Pattern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
