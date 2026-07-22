'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Check, X, Trash2 } from 'lucide-react'

const BONUS_TYPES = [
  { value: 'performance', label: 'Performance Bonus' },
  { value: 'attendance', label: 'Attendance Bonus' },
  { value: 'special', label: 'Special Bonus' },
  { value: 'manual', label: 'Manual Bonus' },
]

export default function BonusManagementPage() {
  const [payrollPeriods, setPayrollPeriods] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [bonuses, setBonuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [formData, setFormData] = useState({
    userId: '',
    type: 'manual',
    amount: '',
    reason: '',
    notes: '',
  })

  useEffect(() => {
    fetchPayrollPeriods()
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectedPeriod) {
      fetchBonuses()
    }
  }, [selectedPeriod])

  const fetchPayrollPeriods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payroll/periods')
      if (response.ok) {
        const data = await response.json()
        setPayrollPeriods(data)
        if (data.length > 0) {
          setSelectedPeriod(data[0].id)
        }
      }
    } catch (error) {
      console.error('[v0] Error fetching payroll periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/users?role=STAFF')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching employees:', error)
    }
  }

  const fetchBonuses = async () => {
    try {
      const response = await fetch(
        `/api/payroll/bonuses?payrollPeriodId=${selectedPeriod}`
      )
      if (response.ok) {
        const data = await response.json()
        setBonuses(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching bonuses:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/payroll/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payrollPeriodId: selectedPeriod,
          ...formData,
        }),
      })

      if (response.ok) {
        await fetchBonuses()
        setIsDialogOpen(false)
        setFormData({
          userId: '',
          type: 'manual',
          amount: '',
          reason: '',
          notes: '',
        })
      }
    } catch (error) {
      console.error('[v0] Error saving bonus:', error)
    }
  }

  const handleApprove = async (bonusId: string) => {
    try {
      const response = await fetch(`/api/payroll/bonuses/${bonusId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (response.ok) {
        await fetchBonuses()
      }
    } catch (error) {
      console.error('[v0] Error approving bonus:', error)
    }
  }

  const handleReject = async (bonusId: string) => {
    try {
      const response = await fetch(`/api/payroll/bonuses/${bonusId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (response.ok) {
        await fetchBonuses()
      }
    } catch (error) {
      console.error('[v0] Error rejecting bonus:', error)
    }
  }

  const handleDelete = async (bonusId: string) => {
    if (confirm('Are you sure you want to delete this bonus?')) {
      try {
        await fetch(`/api/payroll/bonuses/${bonusId}`, {
          method: 'DELETE',
        })
        await fetchBonuses()
      } catch (error) {
        console.error('[v0] Error deleting bonus:', error)
      }
    }
  }

  const getTypeLabel = (type: string) => {
    return BONUS_TYPES.find((t) => t.value === type)?.label || type
  }

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const stats = {
    pending: bonuses.filter((b) => b.status === 'pending_approval').length,
    approved: bonuses.filter((b) => b.status === 'approved').length,
    total: bonuses.reduce((sum, b) => sum + parseFloat(b.amount), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonus Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee bonuses for payroll periods
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">Loading...</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Select Payroll Period</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">Select period...</option>
                {payrollPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {new Date(period.month).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                    })}{' '}
                    - {period.status}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {selectedPeriod && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Approval
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <p className="text-xs text-muted-foreground">
                      Bonuses awaiting approval
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Approved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.approved}</div>
                    <p className="text-xs text-muted-foreground">
                      Bonuses ready for payroll
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(stats.total)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All bonuses combined
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Bonus List</CardTitle>
                    <CardDescription>
                      {bonuses.length} bonus record{bonuses.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Bonus
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Bonus</DialogTitle>
                        <DialogDescription>
                          Record a bonus for an employee
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Employee</label>
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={formData.userId}
                              onChange={(e) =>
                                setFormData({ ...formData, userId: e.target.value })
                              }
                              required
                            >
                              <option value="">Select employee...</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name} ({emp.employeeCode})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Bonus Type</label>
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={formData.type}
                              onChange={(e) =>
                                setFormData({ ...formData, type: e.target.value })
                              }
                              required
                            >
                              {BONUS_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Amount</label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={formData.amount}
                              onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Reason</label>
                            <Input
                              placeholder="e.g., Excellent performance"
                              value={formData.reason}
                              onChange={(e) =>
                                setFormData({ ...formData, reason: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                              placeholder="Additional notes..."
                              value={formData.notes}
                              onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Bonus</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {bonuses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No bonuses added for this period
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bonuses.map((bonus) => (
                          <TableRow key={bonus.id}>
                            <TableCell className="font-medium">
                              {bonus.user.name}
                            </TableCell>
                            <TableCell>{getTypeLabel(bonus.type)}</TableCell>
                            <TableCell>{bonus.reason}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(bonus.amount)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  bonus.status === 'pending_approval'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : bonus.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {bonus.status.replace(/_/g, ' ')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                {bonus.status === 'pending_approval' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleApprove(bonus.id)}
                                      title="Approve"
                                    >
                                      <Check className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReject(bonus.id)}
                                      title="Reject"
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(bonus.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
