'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X, FileText, Loader2, ExternalLink } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface LeaveRequest {
  id: string
  userId: string
  user: {
    name: string
    initials: string | null
    department: string | null
  }
  leaveType: string
  startDate: string
  endDate: string
  reason: string | null
  attachmentUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
}

const leaveTypeMap: Record<string, { label: string; color: string }> = {
  Izin: { label: 'Cuti', color: 'bg-primary/10 text-primary border-primary/20' },
  Sakit: { label: 'Sakit', color: 'bg-chart-5/10 text-chart-5 border-chart-5/20' },
  Darurat: { label: 'Darurat', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  Melahirkan: { label: 'Melahirkan', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  TukarShift: { label: 'Tukar Shift', color: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },
}

const statusStyles: Record<string, string> = {
  'Pending': 'bg-warning/10 text-warning border-warning/20',
  'Approved': 'bg-success/10 text-success border-success/20',
  'Rejected': 'bg-destructive/10 text-destructive border-destructive/20',
}

export function LeaveRequestsTable() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await fetch('/api/leaves')
        if (response.ok) {
          const data = await response.json()
          setLeaves(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch leaves:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaves()
  }, [])

  const handleStatusChange = async (leaveId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: newStatus } : l))
        // Trigger stats refresh
        window.dispatchEvent(new Event('leaveStatusUpdated'))
      } else {
        console.error('[v0] API error:', data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('[v0] Failed to update leave status:', error)
    }
  }

  const getLocationName = (leave: LeaveRequest): string => {
    return 'Unknown Location'
  }

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return differenceInDays(end, start) + 1
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave) => {
                    const leaveType = leaveTypeMap[leave.leaveType] || { label: leave.leaveType, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
                    const days = calculateDays(leave.startDate, leave.endDate)
                    const startFormatted = format(new Date(leave.startDate), 'MMM d, yyyy')
                    const endFormatted = format(new Date(leave.endDate), 'MMM d, yyyy')

                    return (
                      <TableRow key={leave.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {leave.user?.initials || leave.user?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{leave.user?.name}</p>
                              <p className="text-xs text-muted-foreground">{leave.user?.department || '--'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getLocationName(leave)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={leaveType.color}>
                            {leaveType.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {startFormatted} - {endFormatted}
                        </TableCell>
                        <TableCell>
                          {days}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[leave.status]}>
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-7"
                            onClick={() => {
                              setSelectedLeave(leave)
                              setDetailsOpen(true)
                            }}
                          >
                            <FileText className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6 py-4">
              <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{selectedLeave.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <p className="font-medium">{leaveTypeMap[selectedLeave.leaveType]?.label || selectedLeave.leaveType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">{format(new Date(selectedLeave.startDate), 'MMM d, yyyy')} - {format(new Date(selectedLeave.endDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusStyles[selectedLeave.status]}>
                    {selectedLeave.status}
                  </Badge>
                </div>
              </div>

              {selectedLeave.reason && (
                <div>
                  <h3 className="font-semibold mb-2">Reason</h3>
                  <p className="text-sm text-muted-foreground">{selectedLeave.reason}</p>
                </div>
              )}

              {selectedLeave.attachmentUrl && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="size-4" />
                    Attachment Document
                  </h3>
                  <a 
                    href={selectedLeave.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    <FileText className="size-4" />
                    View Document
                  </a>
                </div>
              )}

              {selectedLeave.status === 'Pending' && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button 
                    className="flex-1 gap-2 bg-success/10 text-success hover:bg-success/20"
                    onClick={() => {
                      handleStatusChange(selectedLeave.id, 'Approved')
                      setDetailsOpen(false)
                    }}
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 gap-2 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      handleStatusChange(selectedLeave.id, 'Rejected')
                      setDetailsOpen(false)
                    }}
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
