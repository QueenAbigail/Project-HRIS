'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getPatternAssignments, getSchedulePatterns } from '@/app/superadmin/actions'
import { AddAssignmentDialog } from './AddAssignmentDialog'

interface PatternAssignment {
  id: string
  employeeId: string
  employeeName: string
  employeeRole: string
  patternId: string
  patternName: string
  patternType: string
  status: string
  locationId: string
  locationName: string
  startDate: Date
  endDate: Date | null
  notes: string | null
}

// Custom simple table
const DataTable = ({ columns, data }: { columns: any[], data: any[] }) => {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th key={column.id} className="h-12 px-4 text-left align-middle font-medium text-sm">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-muted-foreground">
                  No assignments found
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column.id} className="p-4 align-middle text-sm">
                      {column.cell ? column.cell({ row: { original: row } }) : row[column.id]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function EmployeeAssignmentTable() {
  const [assignments, setAssignments] = useState<PatternAssignment[]>([])
  const [patterns, setPatterns] = useState<any[]>([])
  const [addAssignmentOpen, setAddAssignmentOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<PatternAssignment | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch assignments and patterns on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [assignmentsData, patternsData] = await Promise.all([
          getPatternAssignments(),
          getSchedulePatterns()
        ])
        setAssignments(assignmentsData)
        setPatterns(patternsData)
      } catch (error) {
        console.error('[v0] Error loading data:', error)
        toast.error('Failed to load assignments')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to remove this pattern assignment?')) {
      return
    }
    // TODO: Implement delete action in server
    toast.info('Delete functionality coming soon')
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Ongoing'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      id: 'employee',
      header: 'Employee',
      cell: ({ row }: { row: { original: PatternAssignment } }) => (
        <div>
          <div className="font-semibold">{row.original.employeeName}</div>
          <div className="text-xs text-muted-foreground">{row.original.employeeRole}</div>
        </div>
      )
    },
    {
      id: 'pattern',
      header: 'Assigned Pattern',
      cell: ({ row }: { row: { original: PatternAssignment } }) => (
        <div>
          <div className="font-medium">{row.original.patternName}</div>
          <div className="text-xs text-muted-foreground capitalize">{row.original.patternType}</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: PatternAssignment } }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      )
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }: { row: { original: PatternAssignment } }) => (
        <Badge variant="secondary">{row.original.locationName}</Badge>
      )
    },
    {
      id: 'dates',
      header: 'Assignment Period',
      cell: ({ row }: { row: { original: PatternAssignment } }) => (
        <div className="text-sm">
          <div>{formatDate(row.original.startDate)}</div>
          {row.original.endDate && (
            <div className="text-xs text-muted-foreground">to {formatDate(row.original.endDate)}</div>
          )}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: PatternAssignment } }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAssignment(row.original)
              setEditOpen(true)
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => handleDeleteAssignment(row.original.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Pattern Assignments</h3>
          <p className="text-sm text-muted-foreground">{assignments.length} active assignments</p>
        </div>
        <Button onClick={() => setAddAssignmentOpen(true)}>
          + Add Assignment
        </Button>
      </div>

      <DataTable columns={columns} data={assignments} />

      <AddAssignmentDialog
        open={addAssignmentOpen}
        onOpenChange={setAddAssignmentOpen}
        patterns={patterns}
      />

      {/* Edit Assignment Dialog */}
      {selectedAssignment && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Employee</label>
                <p className="text-sm mt-1">{selectedAssignment.employeeName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Pattern</label>
                <p className="text-sm mt-1">{selectedAssignment.patternName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm mt-1">{selectedAssignment.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <p className="text-sm mt-1">{selectedAssignment.notes || 'No notes'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Close
              </Button>
              <Button disabled>Update (Coming Soon)</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
