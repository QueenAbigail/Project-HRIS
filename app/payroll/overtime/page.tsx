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
import { Plus, Edit, Trash2, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OvertimeRecord {
  id: string
  employeeName: string
  employeeCode: string
  date: string
  hours: number
  rate: number
  amount: number
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
    hours: 3,
    rate: 50000,
    amount: 150000,
    reason: 'Project deadline',
    approvalStatus: 'approved',
    approvedBy: 'John Doe',
  },
  {
    id: '2',
    employeeName: 'Sarah Williams',
    employeeCode: 'EC-002',
    date: '2026-03-16',
    hours: 4,
    rate: 45000,
    amount: 180000,
    reason: 'Emergency response',
    approvalStatus: 'pending',
  },
  {
    id: '3',
    employeeName: 'David Rodriguez',
    employeeCode: 'EC-003',
    date: '2026-03-17',
    hours: 2,
    rate: 55000,
    amount: 110000,
    reason: 'System maintenance',
    approvalStatus: 'approved',
    approvedBy: 'Jane Smith',
  },
  {
    id: '4',
    employeeName: 'Emily Johnson',
    employeeCode: 'EC-004',
    date: '2026-03-18',
    hours: 5,
    rate: 48000,
    amount: 240000,
    reason: 'Year-end audit',
    approvalStatus: 'rejected',
  },
]

export default function OvertimePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('march-2026')

  const filteredData = mockOvertimeData.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.approvalStatus === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalOvertimeHours = filteredData.reduce((sum, r) => sum + r.hours, 0)
  const totalOvertimeCost = filteredData.reduce((sum, r) => sum + r.amount, 0)
  const approvedCount = filteredData.filter(r => r.approvalStatus === 'approved').length
  const pendingCount = filteredData.filter(r => r.approvalStatus === 'pending').length

  const statusStyles = {
    approved: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    rejected: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Overtime</h1>
          <p className="text-muted-foreground">
            Track and manage employee overtime hours and compensation
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Add Overtime
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOvertimeHours}</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">OT Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalOvertimeCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total expense</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{approvedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Records approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by employee name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="march-2026">March 2026</SelectItem>
            <SelectItem value="february-2026">February 2026</SelectItem>
            <SelectItem value="january-2026">January 2026</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overtime Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Overtime Records</CardTitle>
          <CardDescription>
            Showing {filteredData.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.employeeCode}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(record.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">{record.hours}h</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(record.rate)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(record.amount)}</TableCell>
                    <TableCell className="text-sm">{record.reason}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[record.approvalStatus]}>
                        {record.approvalStatus.charAt(0).toUpperCase() + record.approvalStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredData.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No overtime records found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
