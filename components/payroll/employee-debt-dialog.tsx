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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'

interface EmployeeDebt {
  id: string
  employeeId: string
  employeeName: string
  debtType: string
  amount: number
  monthlyDeduction: number
  remainingMonths: number
  reason: string
  startDate: string
  createdDate: string
}

interface EmployeeDebtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock data - in production this would come from your database
const mockEmployees = [
  { id: 'EMP001', name: 'John Doe' },
  { id: 'EMP002', name: 'Jane Smith' },
  { id: 'EMP003', name: 'Mike Johnson' },
  { id: 'EMP004', name: 'Sarah Williams' },
  { id: 'EMP005', name: 'David Brown' },
]

const mockDebts: EmployeeDebt[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    debtType: 'Personal Loan',
    amount: 5000000,
    monthlyDeduction: 500000,
    remainingMonths: 10,
    reason: 'Personal emergency fund',
    startDate: '2026-01-15',
    createdDate: '2026-01-10',
  },
  {
    id: '2',
    employeeId: 'EMP003',
    employeeName: 'Mike Johnson',
    debtType: 'Training Cost',
    amount: 2000000,
    monthlyDeduction: 200000,
    remainingMonths: 10,
    reason: 'Security Training Course',
    startDate: '2026-02-01',
    createdDate: '2026-01-25',
  },
]

export function EmployeeDebtDialog({ open, onOpenChange }: EmployeeDebtDialogProps) {
  const [debts, setDebts] = useState<EmployeeDebt[]>(mockDebts)
  const [activeTab, setActiveTab] = useState('list')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [debtType, setDebtType] = useState('')
  const [amount, setAmount] = useState('')
  const [monthlyDeduction, setMonthlyDeduction] = useState('')
  const [reason, setReason] = useState('')

  const handleAddDebt = () => {
    if (!selectedEmployee || !debtType || !amount || !monthlyDeduction || !reason) {
      alert('Please fill all fields')
      return
    }

    const employee = mockEmployees.find(e => e.id === selectedEmployee)
    if (!employee) return

    const remainingMonths = Math.ceil(parseInt(amount) / parseInt(monthlyDeduction))
    const newDebt: EmployeeDebt = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: employee.name,
      debtType,
      amount: parseInt(amount),
      monthlyDeduction: parseInt(monthlyDeduction),
      remainingMonths,
      reason,
      startDate: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
    }

    setDebts([...debts, newDebt])
    // Reset form
    setSelectedEmployee('')
    setDebtType('')
    setAmount('')
    setMonthlyDeduction('')
    setReason('')
    setActiveTab('list')
  }

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Employee Debts</DialogTitle>
          <DialogDescription>
            Add and manage employee debts or deductions (personal loans, training costs, etc.)
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Debt List</TabsTrigger>
            <TabsTrigger value="add">Add New Debt</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {debts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No employee debts recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {debts.map(debt => (
                  <Card key={debt.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{debt.employeeName}</CardTitle>
                          <CardDescription>{debt.debtType}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Debt</p>
                          <p className="text-lg font-semibold">{formatCurrency(debt.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Deduction</p>
                          <p className="text-lg font-semibold">{formatCurrency(debt.monthlyDeduction)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining Months</p>
                        <p className="text-sm">{debt.remainingMonths} months</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reason</p>
                        <p className="text-sm">{debt.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Start Date</p>
                        <p className="text-sm">{new Date(debt.startDate).toLocaleDateString('id-ID')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debtType">Debt Type</Label>
                <Select value={debtType} onValueChange={setDebtType}>
                  <SelectTrigger id="debtType">
                    <SelectValue placeholder="Select debt type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                    <SelectItem value="Training Cost">Training Cost</SelectItem>
                    <SelectItem value="Equipment Advance">Equipment Advance</SelectItem>
                    <SelectItem value="Advance Salary">Advance Salary</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Total Debt Amount (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyDeduction">Monthly Deduction (Rp)</Label>
                <Input
                  id="monthlyDeduction"
                  type="number"
                  placeholder="500000"
                  value={monthlyDeduction}
                  onChange={(e) => setMonthlyDeduction(e.target.value)}
                />
              </div>

              {amount && monthlyDeduction && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    Duration: ~{Math.ceil(parseInt(amount) / parseInt(monthlyDeduction))} months
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason/Description</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Security training course, emergency fund..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {activeTab === 'add' && (
            <Button onClick={handleAddDebt} className="gap-2">
              <Plus className="size-4" />
              Add Debt
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
