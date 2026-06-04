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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, Clock, AlertCircle, GripVertical } from 'lucide-react'
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
    amount: 3400000,
    type: 'replacement',
    reason: 'BKO - Replacement duty',
    approvalStatus: 'pending',
  },
  {
    id: '3',
    employeeName: 'David Rodriguez',
    employeeCode: 'EC-003',
    date: '2026-03-20',
    hours: 12,
    baseSalary: 10500000,
    hourlyRate: 437500,
    amount: 6570000,
    type: 'holiday',
    reason: 'National Holiday - Guarding duty',
    approvalStatus: 'approved',
    approvedBy: 'Jane Smith',
  },
  {
    id: '4',
    employeeName: 'Emily Johnson',
    employeeCode: 'EC-004',
    date: '2026-03-17',
    hours: 4,
    baseSalary: 9800000,
    hourlyRate: 408333,
    amount: 1800000,
    type: 'fixed',
    reason: 'Daily work schedule (12h/day)',
    approvalStatus: 'approved',
    approvedBy: 'John Doe',
  },
  {
    id: '5',
    employeeName: 'James Wilson',
    employeeCode: 'EC-005',
    date: '2026-03-18',
    hours: 10,
    baseSalary: 10200000,
    hourlyRate: 425000,
    amount: 4325000,
    type: 'replacement',
    reason: 'BKO - Replacement duty',
    approvalStatus: 'rejected',
  },
  {
    id: '6',
    employeeName: 'Robert Taylor',
    employeeCode: 'EC-006',
    date: '2026-03-21',
    hours: 8,
    baseSalary: 9500000,
    hourlyRate: 395833,
    amount: 4800000,
    type: 'holiday',
    reason: 'National Holiday - Patrolling duty',
    approvalStatus: 'approved',
    approvedBy: 'Jane Smith',
  },
]

export default function ManageOvertimePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'replacement' | 'holiday'>('all')
  const [activeTab, setActiveTab] = useState('records')

  const filteredData = mockOvertimeData.filter(record => {
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

  const statusStyles = {
    approved: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const typeStyles = {
    fixed: 'bg-blue-500/10 text-blue-700 border-blue-200',
    replacement: 'bg-amber-500/10 text-amber-700 border-amber-200',
    holiday: 'bg-red-500/10 text-red-700 border-red-200',
  }

  const getTypeLabel = (type: 'fixed' | 'replacement' | 'holiday') => {
    return overtimeTypes[type].name
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
        <Button className="w-full sm:w-auto">
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
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
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
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Hourly Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <AlertCircle className="size-5 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">No overtime records found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium text-sm">
                            <div>
                              <p>{record.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{record.employeeCode}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{record.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={typeStyles[record.type]}>
                              {getTypeLabel(record.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">{record.hours}h</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(record.hourlyRate)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold text-success">{formatCurrency(record.amount)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{record.reason}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusStyles[record.approvalStatus]}>
                              {record.approvalStatus.charAt(0).toUpperCase() + record.approvalStatus.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
    </div>
  )
}
