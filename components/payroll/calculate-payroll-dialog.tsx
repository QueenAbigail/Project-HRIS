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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CalculatePayrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalculatePayrollDialog({
  open,
  onOpenChange,
}: CalculatePayrollDialogProps) {
  const [month, setMonth] = useState('march-2026')
  const [department, setDepartment] = useState('all')
  const [includeOvertime, setIncludeOvertime] = useState('true')
  const [status, setStatus] = useState<'idle' | 'calculating' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleCalculate = async () => {
    setStatus('calculating')
    setMessage('')

    // Simulate calculation
    setTimeout(() => {
      setStatus('success')
      setMessage(`Payroll calculated successfully for ${month} (${department === 'all' ? 'All Departments' : department}).`)
    }, 2000)
  }

  const handleReset = () => {
    setMonth('march-2026')
    setDepartment('all')
    setIncludeOvertime('true')
    setStatus('idle')
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calculate Payroll</DialogTitle>
          <DialogDescription>
            Select the period and department to calculate payroll
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="month">
              Period <span className="text-red-500">*</span>
            </Label>
            <Select value={month} onValueChange={setMonth} disabled={status === 'calculating'}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="march-2026">March 2026</SelectItem>
                <SelectItem value="february-2026">February 2026</SelectItem>
                <SelectItem value="january-2026">January 2026</SelectItem>
                <SelectItem value="december-2025">December 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={setDepartment} disabled={status === 'calculating'}>
              <SelectTrigger id="department">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="field">Field Security</SelectItem>
                <SelectItem value="surveillance">Surveillance</SelectItem>
                <SelectItem value="patrol">Patrol</SelectItem>
                <SelectItem value="admin">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Overtime */}
          <div className="space-y-2">
            <Label htmlFor="overtime">Include Overtime</Label>
            <Select value={includeOvertime} onValueChange={setIncludeOvertime} disabled={status === 'calculating'}>
              <SelectTrigger id="overtime">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes, Include</SelectItem>
                <SelectItem value="false">No, Exclude</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Messages */}
          {status === 'calculating' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Calculating payroll... Please wait.
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {message || 'An error occurred while calculating payroll.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={status === 'calculating'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCalculate}
            disabled={status === 'calculating' || status === 'success'}
            className={status === 'success' ? 'opacity-70' : ''}
          >
            {status === 'calculating' ? 'Calculating...' : 'Calculate Payroll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
