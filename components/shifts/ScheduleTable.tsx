'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { formatTime } from '@/lib/data'

interface Schedule {
  id: string
  employeeId: string
  employeeName: string
  shiftId: string
  shiftName: string
  shiftStart: string
  shiftEnd: string
  scheduleDate: string
}

interface ScheduleTableProps {
  schedules: Schedule[]
  onEdit?: (schedule: Schedule) => void
  onDelete?: (scheduleId: string) => void
  onRefresh?: () => void
}

export function ScheduleTable({ schedules, onEdit, onDelete, onRefresh }: ScheduleTableProps) {
  const [search, setSearch] = useState('')
  const [showPast, setShowPast] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = schedules
    .filter(s => {
      // Filter by search (name, ID, shift, and date)
      const searchLower = search.toLowerCase()
      const scheduleDate = new Date(s.scheduleDate)
      const formattedDate = scheduleDate.toLocaleDateString('en-GB') // dd/mm/yyyy
      
      const matchesSearch =
        s.employeeName.toLowerCase().includes(searchLower) ||
        s.employeeId.toLowerCase().includes(searchLower) ||
        s.shiftName.toLowerCase().includes(searchLower) ||
        formattedDate.includes(searchLower) ||
        s.scheduleDate.includes(searchLower) // yyyy-mm-dd format

      if (!matchesSearch) return false

      // Filter by past dates
      if (!showPast) {
        const scheduleDateCheck = new Date(s.scheduleDate)
        scheduleDateCheck.setHours(0, 0, 0, 0)
        return scheduleDateCheck >= today
      }

      return true
    })
    .sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime())

  // Calculate pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSchedules = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule?')) return

    try {
      setDeleting(id)
      const response = await fetch(`/api/schedules/${id}`, { method: 'DELETE' })

      if (!response.ok) throw new Error('Delete failed')

      toast.success('Schedule deleted')
      onRefresh?.()
    } catch (error) {
      toast.error('Failed to delete schedule')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, shift, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showPast"
            checked={showPast}
            onCheckedChange={(checked) => setShowPast(checked as boolean)}
          />
          <Label htmlFor="showPast" className="font-normal cursor-pointer text-sm">
            Show past schedules
          </Label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No schedules found</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchedules.map((schedule) => (
                <TableRow key={schedule.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{schedule.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{schedule.employeeId}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.scheduleDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.shiftName}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {formatTime(schedule.shiftStart)} - {formatTime(schedule.shiftEnd)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit?.(schedule)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(schedule.id)}
                        disabled={deleting === schedule.id}
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
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} schedules
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
