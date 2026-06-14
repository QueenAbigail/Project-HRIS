'use client'

import { useState, useEffect } from 'react'
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
import { assignPatternToEmployee, getAllEmployees } from '@/app/superadmin/actions'

interface AddAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees?: any[]
  patterns?: any[]
}

export function AddAssignmentDialog({
  open,
  onOpenChange,
  patterns = [],
}: AddAssignmentDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedPattern, setSelectedPattern] = useState('')
  const [loading, setLoading] = useState(false)
  const [allEmployees, setAllEmployees] = useState<any[]>([])

  // Fetch all employees when dialog opens
  useEffect(() => {
    if (open) {
      const fetchEmployees = async () => {
        try {
          const employeesData = await getAllEmployees()
          setAllEmployees(employeesData)
          console.log('[v0] All employees loaded in dialog:', {
            count: employeesData.length,
            employees: employeesData.map(e => ({ id: e.employeeId, name: e.employeeName }))
          })
        } catch (error) {
          console.error('[v0] Error loading employees:', error)
          toast.error('Failed to load employees')
        }
      }
      fetchEmployees()
    }
  }, [open])

  // Debug: Log patterns when dialog opens
  useEffect(() => {
    if (open) {
      console.log('[v0] Dialog opened with patterns:', {
        patternsCount: patterns.length,
        patterns: patterns.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type
        }))
      })
    }
  }, [open, patterns])

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
      
      // Refresh page to show new assignment
      window.location.reload()
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
                {allEmployees.length > 0 ? (
                  allEmployees.map((employee) => (
                    <SelectItem key={employee.employeeId} value={employee.employeeId}>
                      {employee.employeeName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_" disabled>
                    No employees available
                  </SelectItem>
                )}
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
