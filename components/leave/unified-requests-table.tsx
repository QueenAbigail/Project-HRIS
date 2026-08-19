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
import { Check, X, FileText, Loader2, ArrowRight } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { LeaveRequestDetailsModal } from './leave-request-details-modal'
import { ShiftSwapDetailsModal } from './shift-swap-details-modal'

interface UnifiedRequest {
  id: string
  type: 'leave' | 'shiftswap'
  employeeFromId: string
  employeeToId?: string
  user?: {
    name: string
    initials: string | null
    department: string | null
  }
  employeeFrom?: {
    name: string
    employeeCode: string
    department: string
  }
  employeeTo?: {
    name: string
    employeeCode: string
    department: string
  }
  leaveType?: string
  startDate: string
  endDate: string
  swapDate?: string
  reason: string | null
  attachmentUrl?: string | null
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

export function UnifiedRequestsTable() {
  const [requests, setRequests] = useState<UnifiedRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeave, setSelectedLeave] = useState<UnifiedRequest | null>(null)
  const [selectedSwap, setSelectedSwap] = useState<UnifiedRequest | null>(null)
  const [leaveDetailsOpen, setLeaveDetailsOpen] = useState(false)
  const [swapDetailsOpen, setSwapDetailsOpen] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const [leavesRes, swapsRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/shift-swaps'),
      ])

      const leaves = leavesRes.ok ? await leavesRes.json() : []
      const swaps = swapsRes.ok ? await swapsRes.json() : []

      const unifiedRequests: UnifiedRequest[] = [
        ...leaves.map((leave: any) => ({
          ...leave,
          type: 'leave',
        })),
        ...swaps.map((swap: any) => ({
          ...swap,
          type: 'shiftswap',
          employeeFromId: swap.employeeFromId,
        })),
      ]

      // Sort by date descending
      unifiedRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setRequests(unifiedRequests)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveStatusChange = async (leaveId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setRequests(
          requests.map((r) =>
            r.id === leaveId && r.type === 'leave' ? { ...r, status: newStatus } : r
          )
        )
        window.dispatchEvent(new Event('leaveStatusUpdated'))
      }
    } catch (error) {
    }
  }

  const handleSwapStatusChange = async (swapId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`/api/shift-swaps/${swapId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setRequests(
          requests.map((r) =>
            r.id === swapId && r.type === 'shiftswap' ? { ...r, status: newStatus } : r
          )
        )
      }
    } catch (error) {
    }
  }

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return differenceInDays(end, start) + 1
  }

  const getRequestDisplay = (request: UnifiedRequest) => {
    if (request.type === 'leave') {
      return {
        title: `${request.user?.name}`,
        department: request.user?.department || '--',
        typeLabel: leaveTypeMap[request.leaveType || '']?.label || request.leaveType,
        typeColor: leaveTypeMap[request.leaveType || '']?.color || 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        period: `${format(new Date(request.startDate), 'MMM d')} - ${format(new Date(request.endDate), 'MMM d, yyyy')}`,
        days: calculateDays(request.startDate, request.endDate),
      }
    } else {
      return {
        title: `${request.employeeFrom?.name} ↔ ${request.employeeTo?.name}`,
        department: request.employeeFrom?.department || '--',
        typeLabel: 'Shift Swap',
        typeColor: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
        period: format(new Date(request.swapDate || ''), 'MMM d, yyyy'),
        days: 1,
      }
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Requests</CardTitle>
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
          <CardTitle>Leave & Shift Swap Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => {
                    const display = getRequestDisplay(request)

                    return (
                      <TableRow key={`${request.type}-${request.id}`} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {request.type === 'leave'
                                  ? request.user?.initials || request.user?.name?.charAt(0) || '?'
                                  : request.employeeFrom?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{display.title}</p>
                              <p className="text-xs text-muted-foreground">{display.department}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={display.typeColor}>
                            {display.typeLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{display.period}</TableCell>
                        <TableCell>{display.days}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyles[request.status]}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            onClick={() => {
                              if (request.type === 'leave') {
                                setSelectedLeave(request)
                                setLeaveDetailsOpen(true)
                              } else {
                                setSelectedSwap(request)
                                setSwapDetailsOpen(true)
                              }
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

      {selectedLeave && (
        <LeaveRequestDetailsModal
          isOpen={leaveDetailsOpen}
          onClose={() => setLeaveDetailsOpen(false)}
          leave={selectedLeave}
          onApprove={(id) => handleLeaveStatusChange(id, 'Approved')}
          onReject={(id) => handleLeaveStatusChange(id, 'Rejected')}
        />
      )}

      {selectedSwap && (
        <ShiftSwapDetailsModal
          isOpen={swapDetailsOpen}
          onClose={() => setSwapDetailsOpen(false)}
          swap={selectedSwap}
          onApprove={(id) => handleSwapStatusChange(id, 'Approved')}
          onReject={(id) => handleSwapStatusChange(id, 'Rejected')}
        />
      )}
    </>
  )
}
