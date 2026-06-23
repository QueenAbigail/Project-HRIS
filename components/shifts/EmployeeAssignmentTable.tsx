'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { BulkImportDialog } from './BulkImportDialog'
import { Upload, Search, X } from 'lucide-react'

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

interface FilterState {
  searchText: string
  status: string
  location: string
  patternType: string
}

export function EmployeeAssignmentTable() {
  const [assignments, setAssignments] = useState<PatternAssignment[]>([])
  const [patterns, setPatterns] = useState<any[]>([])
  const [addAssignmentOpen, setAddAssignmentOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<PatternAssignment | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    status: '',
    location: '',
    patternType: '',
  })

  // Fetch assignments and patterns on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [assignmentsData, patternsData] = await Promise.all([
          getPatternAssignments(),
          getSchedulePatterns()
        ])

        setAssignments(assignmentsData)
        setPatterns(patternsData)
        console.log('[v0] Data loaded successfully:', {
          assignments: assignmentsData.length,
          patterns: patternsData.length
        })
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

  // Get unique values for filter dropdowns
  const uniqueStatuses = Array.from(new Set(assignments.map(a => a.status)))
  const uniqueLocations = Array.from(new Set(assignments.map(a => a.locationName)))
  const uniquePatternTypes = Array.from(new Set(assignments.map(a => a.patternType)))

  // Filter assignments based on active filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !filters.searchText || 
      assignment.employeeName.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      assignment.patternName.toLowerCase().includes(filters.searchText.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || !filters.status || assignment.status === filters.status
    const matchesLocation = filters.location === 'all' || !filters.location || assignment.locationName === filters.location
    const matchesPatternType = filters.patternType === 'all' || !filters.patternType || assignment.patternType === filters.patternType

    return matchesSearch && matchesStatus && matchesLocation && matchesPatternType
  })

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchText: '',
      status: '',
      location: '',
      patternType: '',
    })
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all')

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
            disabled
            title="Edit employee site on Employee page instead"
          >
            View
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
          <p className="text-sm text-muted-foreground">
            {filteredAssignments.length} of {assignments.length} assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setAddAssignmentOpen(true)}>
            + Add Assignment
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-muted/30 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-3"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <Input
            placeholder="Search employee or pattern..."
            value={filters.searchText}
            onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
            className="h-9"
          />

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueStatuses.sort().map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.sort().map(location => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Pattern Type Filter */}
          <Select value={filters.patternType} onValueChange={(value) => setFilters(prev => ({ ...prev, patternType: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Pattern Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pattern Types</SelectItem>
              {uniquePatternTypes.sort().map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable columns={columns} data={filteredAssignments} />

      <AddAssignmentDialog
        open={addAssignmentOpen}
        onOpenChange={setAddAssignmentOpen}
        patterns={patterns}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
      />


    </div>
  )
}
