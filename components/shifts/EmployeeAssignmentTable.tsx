'use client'

import { useState } from 'react'
import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { useEmployeesWithAttendance } from './hooks'
// Custom simple table since no DataTable component
const DataTable = ({ columns, data }: { columns: any[], data: any[] }) => {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th key={column.accessorKey || column.id} className="h-12 px-4 text-left align-middle font-medium text-sm [&:has([role=checkbox])]:pr-0">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-muted/50">
                {columns.map((column) => (
                  <td key={column.accessorKey || column.id} className="p-4 align-middle whitespace-nowrap text-sm">
                    {column.cell ? column.cell({ row: { original: row } }) : row[column.accessorKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShiftFormDialog } from './ShiftFormDialog'
import { WorkingDaysSelector } from './WorkingDaysSelector'
import { EmployeeSwapDialog } from './EmployeeSwapDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface EmployeeAssignmentTableProps { }

export function EmployeeAssignmentTable({ }: EmployeeAssignmentTableProps) {
  const [editShiftOpen, setEditShiftOpen] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const employees = useEmployeesWithAttendance()
  const shifts = useSchedulesStore(state => state.shifts)
  const assignEmployeeShift = useSchedulesStore(state => state.assignEmployeeShift)

  const columns = [
    // Employee column
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="font-medium">{row.original.employeeName}</div>
          <Badge variant="outline" className="text-xs">
            {row.original.initials}
          </Badge>
        </div>
      )
    },
    // Current Shift
    {
      accessorKey: 'shiftName',
      header: 'Shift',
      cell: ({ row }) => (
        <Badge>{row.original.shiftName}</Badge>
      )
    },
    // Location
    {
      accessorKey: 'locationName',
      header: 'Location',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.locationName}</Badge>
      )
    },
    // Working Days
    {
      accessorKey: 'workingDays',
      header: 'Days',
      cell: ({ row }) => {
        // Amankan nilai workingDays biar nggak crash kalau null
        const days = Array.isArray(row.original?.workingDays) ? row.original.workingDays : [];
        return (
          <div className="text-xs">
            {days.map(day => (
              <span key={day} className="mr-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day]}
              </span>
            ))}
          </div>
        )
      },
    // Actions
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <WorkingDaysSelector
            employeeId={row.original.employeeId}
            currentDays={row.original.workingDays}
          />
          <Select onValueChange={(shiftId) => {
            if (shiftId) {
              assignEmployeeShift(row.original.employeeId, shiftId as string, row.original.locationId, row.original.workingDays)
            }
          }}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Reassign Shift" />
            </SelectTrigger>
            <SelectContent>
              {shifts.map(shift => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setSwapOpen(true)}>
            Swap
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setEditShiftOpen(true)}>
          Manage Shifts
        </Button>
        <Button variant="outline" onClick={() => setSwapOpen(true)}>
          Quick Swap
        </Button>
      </div>

      <DataTable columns={columns} data={employees} />

      <ShiftFormDialog
        open={editShiftOpen}
        onOpenChange={setEditShiftOpen}
      />
      <EmployeeSwapDialog
        open={swapOpen}
        onOpenChange={setSwapOpen}
      />
    </div>
  )
}

