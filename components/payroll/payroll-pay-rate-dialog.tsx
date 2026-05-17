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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertCircle, CheckCircle2, Save } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PayRateEmployee {
  id: string
  name: string
  initials: string
  department: string
  currentDailyRate: number
  newDailyRate: number | null
  baseSalary: number
}

interface PayrollPayRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const payRateData: PayRateEmployee[] = [
  {
    id: 'EMP001',
    name: 'Michael Chen',
    initials: 'MC',
    department: 'Field Security',
    currentDailyRate: 127.27,
    newDailyRate: null,
    baseSalary: 2800,
  },
  {
    id: 'EMP002',
    name: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    currentDailyRate: 118.18,
    newDailyRate: null,
    baseSalary: 2600,
  },
  {
    id: 'EMP003',
    name: 'David Rodriguez',
    initials: 'DR',
    department: 'Patrol',
    currentDailyRate: 145.45,
    newDailyRate: null,
    baseSalary: 3200,
  },
  {
    id: 'EMP004',
    name: 'Emily Johnson',
    initials: 'EJ',
    department: 'Administration',
    currentDailyRate: 159.09,
    newDailyRate: null,
    baseSalary: 3500,
  },
  {
    id: 'EMP005',
    name: 'James Wilson',
    initials: 'JW',
    department: 'Field Security',
    currentDailyRate: 109.09,
    newDailyRate: null,
    baseSalary: 2400,
  },
  {
    id: 'EMP006',
    name: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    currentDailyRate: 100,
    newDailyRate: null,
    baseSalary: 2200,
  },
]

export function PayrollPayRateDialog({
  open,
  onOpenChange,
}: PayrollPayRateDialogProps) {
  const [employees, setEmployees] = useState<PayRateEmployee[]>(payRateData)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleRateChange = (id: string, newRate: string) => {
    const rate = newRate === '' ? null : parseFloat(newRate)
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? { ...emp, newDailyRate: rate }
          : emp
      )
    )
  }

  const handleSaveChanges = () => {
    setIsSaving(true)
    setSaveMessage('')

    // Simulate API call
    setTimeout(() => {
      const changedRates = employees.filter((emp) => emp.newDailyRate !== null)
      if (changedRates.length > 0) {
        console.log('[v0] Pay rates updated:', changedRates)
        setSaveMessage(`Successfully updated ${changedRates.length} employee pay rate(s). Payroll will be recalculated.`)
        
        // Reset the new rates after saving
        setEmployees(
          employees.map((emp) => ({
            ...emp,
            currentDailyRate: emp.newDailyRate !== null ? emp.newDailyRate : emp.currentDailyRate,
            newDailyRate: null,
          }))
        )
      } else {
        setSaveMessage('No changes to save.')
      }
      setIsSaving(false)
    }, 1000)
  }

  const handleCancel = () => {
    setEmployees(
      employees.map((emp) => ({
        ...emp,
        newDailyRate: null,
      }))
    )
    setSaveMessage('')
    onOpenChange(false)
  }

  const hasChanges = employees.some((emp) => emp.newDailyRate !== null)
  const changedCount = employees.filter((emp) => emp.newDailyRate !== null).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payroll Pay Rate Management</DialogTitle>
          <DialogDescription>
            Update daily pay rates for employees. Changes will trigger automatic payroll recalculation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {saveMessage && (
            <Alert className={saveMessage.includes('Successfully') ? 'bg-green-500/10 border-green-500/20' : 'bg-blue-500/10 border-blue-500/20'}>
              {saveMessage.includes('Successfully') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription className={saveMessage.includes('Successfully') ? 'text-green-700' : 'text-blue-700'}>
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Pay Rate Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Department</TableHead>
                    <TableHead className="text-right">Current Daily Rate</TableHead>
                    <TableHead className="text-right">New Daily Rate</TableHead>
                    <TableHead className="text-center">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => {
                    const change = emp.newDailyRate !== null
                      ? emp.newDailyRate - emp.currentDailyRate
                      : null
                    const percentChange = change !== null
                      ? ((change / emp.currentDailyRate) * 100).toFixed(2)
                      : null

                    return (
                      <TableRow key={emp.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarImage src={`/avatars/${emp.id}.jpg`} alt={emp.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {emp.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{emp.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {emp.department}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          ${emp.currentDailyRate.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={emp.newDailyRate !== null ? emp.newDailyRate : ''}
                            onChange={(e) => handleRateChange(emp.id, e.target.value)}
                            placeholder="Enter new rate"
                            className="w-28 text-right font-mono"
                            disabled={isSaving}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {change !== null && (
                            <span className={`text-sm font-semibold ${
                              change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({percentChange}%)
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {hasChanges && (
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                {changedCount} employee pay rate{changedCount !== 1 ? 's' : ''} will be updated. Payroll will be automatically recalculated.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 size-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
