'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Clock, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Overtime Types with Rate Multipliers
const overtimeTypes = {
  fixed: {
    name: 'Fixed OT',
    description: 'Overtime due to work schedule (12h/day vs 8h rule)',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    multipliers: [
      { hour: 1, multiplier: 1.5, description: '1st hour' },
      { hour: 2, multiplier: 2.0, description: '2nd hour' },
      { hour: 3, multiplier: 2.0, description: '3rd-4th hours' },
      { hour: 5, multiplier: 2.0, description: '5th+ hours' },
    ]
  },
  replacement: {
    name: 'OT Replacement (BKO)',
    description: 'Overtime for replacement duty when unable to attend',
    color: 'bg-amber-500/10 text-amber-700 border-amber-200',
    multipliers: [
      { hour: 1, multiplier: 1.25, description: '1st hour' },
      { hour: 2, multiplier: 1.5, description: '2nd hour' },
      { hour: 3, multiplier: 1.75, description: '3rd hour' },
      { hour: 4, multiplier: 2.0, description: '4th+ hours' },
    ]
  },
  holiday: {
    name: 'OT at National Holiday',
    description: 'Overtime for guarding/patrolling on national holidays',
    color: 'bg-red-500/10 text-red-700 border-red-200',
    multipliers: [
      { hour: 1, multiplier: 2.0, description: '1st hour' },
      { hour: 2, multiplier: 2.5, description: '2nd hour' },
      { hour: 3, multiplier: 3.0, description: '3rd hour' },
      { hour: 4, multiplier: 3.0, description: '4th+ hours' },
    ]
  }
}

interface OvertimeRecord {
  id: string
  employeeName: string
  employeeCode: string
  date: string
  hours: number
  baseSalary: number
  hourlyRate: number
  amount: number
  type: 'fixed' | 'replacement' | 'holiday'
  reason: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
}

const mockOvertimeData: OvertimeRecord[] = [
  {
    id: '1',
    employeeName: 'Michael Chen',
    employeeCode: 'EC-001',
    date: '2026-03-15',
    hours: 4,
    baseSalary: 12000000,
    hourlyRate: 500000,
    amount: 2200000,
    type: 'fixed',
    reason: 'Daily work schedule (12h/day)',
    approvalStatus: 'approved',
    approvedBy: 'John Doe',
  },
  {
    id: '2',
    employeeName: 'Sarah Williams',
    employeeCode: 'EC-002',
    date: '2026-03-16',
    hours: 8,
    baseSalary: 11000000,
    hourlyRate: 458333,
    amount: 3640000,
    type: 'replacement',
    reason: 'Replacement duty - Employee absent',
    approvalStatus: 'pending',
  },
  {
    id: '3',
    employeeName: 'David Rodriguez',
    employeeCode: 'EC-003',
    date: '2026-03-10',
    hours: 12,
    baseSalary: 10500000,
    hourlyRate: 437500,
    amount: 7785000,
    type: 'holiday',
    reason: 'National Holiday - Guarding duty',
    approvalStatus: 'approved',
    approvedBy: 'Jane Smith',
  },
]

// Mock employees
const mockEmployees = [
  { code: 'EC-001', name: 'Michael Chen', baseSalary: 12000000 },
  { code: 'EC-002', name: 'Sarah Williams', baseSalary: 11000000 },
  { code: 'EC-003', name: 'David Rodriguez', baseSalary: 10500000 },
  { code: 'EC-004', name: 'Emily Johnson', baseSalary: 9800000 },
  { code: 'EC-005', name: 'James Wilson', baseSalary: 10200000 },
]

export default function ManageOvertimePage() {
  const [data, setData] = useState<OvertimeRecord[]>(mockOvertimeData)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('records')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    employeeCode: '',
    date: '',
    hours: '',
    type: 'fixed' as 'fixed' | 'replacement' | 'holiday',
    reason: '',
  })

  // Calculate totals
  const filteredData = data.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.approvalStatus === filterStatus
    const matchesType = filterType === 'all' || record.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const totalOvertimeAmount = filteredData.reduce((sum, r) => sum + r.amount, 0)
  const totalOvertimeHours = filteredData.reduce((sum, r) => sum + r.hours, 0)
  const approvedAmount = filteredData.filter(r => r.approvalStatus === 'approved').reduce((sum, r) => sum + r.amount, 0)
  const pendingAmount = filteredData.filter(r => r.approvalStatus === 'pending').reduce((sum, r) => sum + r.amount, 0)

  const getOvertimeTypeColor = (type: string) => {
    const typeConfig = overtimeTypes[type as keyof typeof overtimeTypes]
    return typeConfig?.color || ''
  }

  const getOvertimeTypeName = (type: string) => {
    const typeConfig = overtimeTypes[type as keyof typeof overtimeTypes]
    return typeConfig?.name || type
  }

  const handleAddClick = () => {
    setFormData({
      employeeCode: '',
      date: '',
      hours: '',
      type: 'fixed',
      reason: '',
    })
    setEditingId(null)
    setIsAddModalOpen(true)
  }

  const handleEditClick = (record: OvertimeRecord) => {
    setFormData({
      employeeCode: record.employeeCode,
      date: record.date,
      hours: record.hours.toString(),
      type: record.type,
      reason: record.reason,
    })
    setEditingId(record.id)
    setIsEditModalOpen(true)
  }

  const handleSaveRecord = () => {
    const selectedEmployee = mockEmployees.find(e => e.code === formData.employeeCode)
    if (!selectedEmployee) return

    const hours = parseInt(formData.hours)
    const hourlyRate = selectedEmployee.baseSalary / 22 / 8
    
    // Calculate amount based on type and hours
    let amount = 0
    const typeMultipliers = overtimeTypes[formData.type].multipliers
    for (let i = 0; i < hours; i++) {
      let multiplier = 1.5
      for (const m of typeMultipliers) {
        if (i + 1 >= m.hour) multiplier = m.multiplier
      }
      amount += hourlyRate * multiplier
    }

    if (editingId) {
      // Update existing record
      setData(prev => prev.map(record =>
        record.id === editingId
          ? {
              ...record,
              employeeCode: formData.employeeCode,
              employeeName: selectedEmployee.name,
              date: formData.date,
              hours,
              hourlyRate,
              amount,
              type: formData.type,
              reason: formData.reason,
            }
          : record
      ))
      setIsEditModalOpen(false)
    } else {
      // Add new record
      const newRecord: OvertimeRecord = {
        id: (data.length + 1).toString(),
        employeeName: selectedEmployee.name,
        employeeCode: formData.employeeCode,
        date: formData.date,
        hours,
        baseSalary: selectedEmployee.baseSalary,
        hourlyRate,
        amount,
        type: formData.type,
        reason: formData.reason,
        approvalStatus: 'pending',
      }
      setData([...data, newRecord])
      setIsAddModalOpen(false)
    }
  }

  const handleDeleteRecord = (id: string) => {
    setData(prev => prev.filter(record => record.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Overtime</h1>
          <p className="text-muted-foreground">
            Manage and track employee overtime across different types
          </p>
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Add Overtime Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total OT Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalOvertimeAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalOvertimeHours} hours total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(approvedAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ready to process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{formatCurrency(pendingAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Records Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filteredData.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total records</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Overtime Records</TabsTrigger>
          <TabsTrigger value="rates">Rate Multipliers</TabsTrigger>
        </TabsList>

        {/* Overtime Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overtime Records</CardTitle>
              <CardDescription>
                View and manage all employee overtime entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  placeholder="Search by name or employee code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={(value) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fixed">Fixed OT</SelectItem>
                    <SelectItem value="replacement">OT Replacement (BKO)</SelectItem>
                    <SelectItem value="holiday">OT at National Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Hourly Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-semibold">{record.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{record.employeeCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="text-right">{record.hours}h</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.hourlyRate)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(record.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getOvertimeTypeColor(record.type)}>
                            {getOvertimeTypeName(record.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{record.reason}</TableCell>
                        <TableCell>
                          <Badge variant={record.approvalStatus === 'approved' ? 'default' : record.approvalStatus === 'pending' ? 'secondary' : 'destructive'}>
                            {record.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(record)}
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Multipliers Tab */}
        <TabsContent value="rates" className="space-y-4">
          {Object.entries(overtimeTypes).map(([key, type]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{type.name}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className={type.color}>
                    {type.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {type.multipliers.map((mult, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{mult.description}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Rate Multiplier</p>
                        <p className="text-2xl font-bold">{mult.multiplier}x</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Base rate × {mult.multiplier}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Calculation Example:</p>
                  <p className="text-sm text-muted-foreground">
                    If hourly rate is Rp 500,000, the 1st hour would be Rp {(500000 * overtimeTypes[key as keyof typeof overtimeTypes].multipliers[0].multiplier).toLocaleString('id-ID')}, 
                    2nd hour would be Rp {(500000 * overtimeTypes[key as keyof typeof overtimeTypes].multipliers[1].multiplier).toLocaleString('id-ID')}, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Overtime Dialog */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
        }
      }}>
        <DialogContent className="w-[95vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Overtime Record' : 'Add Overtime Record'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the overtime details' : 'Create a new overtime record with tiered rate multipliers'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={formData.employeeCode} onValueChange={(value) => setFormData({ ...formData, employeeCode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map(emp => (
                    <SelectItem key={emp.code} value={emp.code}>
                      {emp.name} ({emp.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            {/* Overtime Type */}
            <div className="space-y-2">
              <Label>Overtime Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed OT (12h/day vs 8h rule)</SelectItem>
                  <SelectItem value="replacement">OT Replacement (BKO)</SelectItem>
                  <SelectItem value="holiday">OT at National Holiday</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {overtimeTypes[formData.type].description}
              </p>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <Label>Hours</Label>
              <Input
                type="number"
                min="1"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="Enter hours"
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Reason for overtime"
              />
            </div>

            {/* Rate Info */}
            {formData.employeeCode && formData.hours && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold mb-3">Tiered Rate Calculation</p>
                <div className="space-y-2">
                  {overtimeTypes[formData.type].multipliers.slice(0, Math.min(parseInt(formData.hours), 4)).map((mult, idx) => {
                    const employee = mockEmployees.find(e => e.code === formData.employeeCode)
                    const hourlyRate = employee ? employee.baseSalary / 22 / 8 : 0
                    const hourAmount = hourlyRate * mult.multiplier
                    return (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>{mult.description}: {mult.multiplier}x</span>
                        <span>{formatCurrency(hourAmount)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveRecord}>
                {editingId ? 'Update Record' : 'Add Record'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
