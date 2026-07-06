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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { assignPatternToEmployee, getAllEmployees } from '@/app/superadmin/actions'
import { validateAssignment, formatValidationErrors } from '@/lib/pattern-validation'
import { AttendancePreview } from './AttendancePreview'
import { AlertTriangle, CheckCircle } from 'lucide-react'

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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [allEmployees, setAllEmployees] = useState<any[]>([])

  // Set default start date to today
  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0]
      setStartDate(today)
    }
  }, [open])

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
    if (!selectedEmployee || !selectedPattern || !startDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const startDateObj = new Date(startDate)
      const endDateObj = endDate ? new Date(endDate) : null

      // Validate assignment using validation utility
      const validation = validateAssignment({
        employeeId: selectedEmployee,
        patternId: selectedPattern,
        startDate: startDateObj,
        endDate: endDateObj
      })

      if (!validation.isValid) {
        const errorMessage = validation.errors.join('\n')
        toast.error(`Validation failed:\n${errorMessage}`)
        return
      }

      // Show warnings as toast info
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast.info(warning)
        })
      }
      
      // Call server action with enhanced options
      const result = await assignPatternToEmployee(selectedEmployee, selectedPattern, {
        startDate: startDateObj,
        endDate: endDateObj,
        notes: notes || undefined
      })

      toast.success(result.message)
      setSelectedEmployee('')
      setSelectedPattern('')
      setStartDate('')
      setEndDate('')
      setNotes('')
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Shift Pattern to Employee</DialogTitle>
          <DialogDescription>
            Select an employee and assign them a shift pattern. The system will automatically generate attendance records and shifts based on the pattern.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.length > 0 ? (
                  allEmployees.map((employee) => (
                    <SelectItem key={employee.employeeId} value={employee.employeeId}>
                      {employee.employeeName} ({employee.role})
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
            <Label htmlFor="pattern">Shift Pattern *</Label>
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

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for ongoing assignment
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="e.g., Temporary assignment, Contract renewal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Attendance Preview */}
          {selectedEmployee && selectedPattern && startDate && (
            <div className="border-t pt-4">
              <AttendancePreview
                employeeId={selectedEmployee}
                patternId={selectedPattern}
                startDate={new Date(startDate)}
                patterns={patterns}
                employees={allEmployees}
              />
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">What happens next:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Attendance records will be auto-generated</li>
              <li>Shifts will be generated based on pattern rules</li>
              <li>Employee will receive notification</li>
              <li>Assignment will be logged for audit trail</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedEmployee || !selectedPattern || !startDate}>
            {loading ? 'Assigning...' : 'Assign Pattern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
