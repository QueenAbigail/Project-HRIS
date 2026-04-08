'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { useEmployeesWithAttendance } from './hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Users, Switch } from 'lucide-react'

interface EmployeeSwapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeSwapDialog({ open, onOpenChange }: EmployeeSwapDialogProps) {
  const swapEmployees = useSchedulesStore(state => state.swapEmployees)
  const [employeeAId, setEmployeeAId] = useState('')
  const [employeeBId, setEmployeeBId] = useState('')
  const [autoAdjustAttendance, setAutoAdjustAttendance] = useState(true)
  const employees = useEmployeesWithAttendance() // Hook for employees w/ schedule/attendance

  const handleSwap = () => {
    if (!employeeAId || !employeeBId || employeeAId === employeeBId) {
      toast.error('Select two different employees')
      return
    }
    swapEmployees(employeeAId, employeeBId, autoAdjustAttendance)
    onOpenChange(false)
  }

  const employeeA = employees.find(e => e.employeeId === employeeAId)
  const employeeB = employees.find(e => e.employeeId === employeeBId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Swap Employees
          </DialogTitle>
          <DialogDescription>
            Swap schedules between two employees. Optionally adjust today's attendance records.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Employee A (to receive B's schedule)</Label>
            <Select value={employeeAId} onValueChange={setEmployeeAId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee A" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.employeeId} value={emp.employeeId}>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback>{emp.initials}</AvatarFallback>
                      </Avatar>
                      {emp.employeeName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employeeA && (
              <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                Current: {employeeA.shiftName} @ {employeeA.locationName}, Status: <Badge variant="outline">{employeeA.status}</Badge>
              </div>
            )}
          </div>

          <div>
            <Label>Employee B (to receive A's schedule)</Label>
            <Select value={employeeBId} onValueChange={setEmployeeBId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Employee B" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.employeeId} value={emp.employeeId}>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback>{emp.initials}</AvatarFallback>
                      </Avatar>
                      {emp.employeeName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employeeB && (
              <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                Current: {employeeB.shiftName} @ {employeeB.locationName}, Status: <Badge variant="outline">{employeeB.status}</Badge>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 p-3 border rounded-md">
            <Checkbox 
              id="auto-adjust" 
              checked={autoAdjustAttendance} 
              onCheckedChange={(checked) => setAutoAdjustAttendance(checked as boolean)} 
            />
            <Label htmlFor="auto-adjust" className="font-normal">
              Auto-adjust today's attendance records (swap check-ins automatically)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSwap} disabled={!employeeAId || !employeeBId}>
            Swap Employees
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

