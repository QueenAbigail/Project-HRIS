'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, X, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface LeaveRequestDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  leave: any
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

export function LeaveRequestDetailsModal({
  isOpen,
  onClose,
  leave,
  onApprove,
  onReject,
}: LeaveRequestDetailsModalProps) {
  const [loading, setLoading] = useState(false)

  if (!leave) return null

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onApprove(leave.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await onReject(leave.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const leaveTypeMap: Record<string, { label: string }> = {
    Izin: { label: 'Cuti' },
    Sakit: { label: 'Sakit' },
    Darurat: { label: 'Darurat' },
    Melahirkan: { label: 'Melahirkan' },
    TukarShift: { label: 'Tukar Shift' },
  }

  const statusColor = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  }[leave.status]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogDescription>Review and manage leave request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Employee</Label>
            <p className="text-sm font-medium">{leave.user?.name}</p>
            <p className="text-xs text-muted-foreground">{leave.user?.department}</p>
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Leave Type</Label>
            <p className="text-sm font-medium">
              {leaveTypeMap[leave.leaveType]?.label || leave.leaveType}
            </p>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Period</Label>
            <p className="text-sm font-medium">
              {format(new Date(leave.startDate), 'MMM d, yyyy')} -{' '}
              {format(new Date(leave.endDate), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Badge className={`${statusColor} border-0`}>{leave.status}</Badge>
          </div>

          {/* Reason */}
          {leave.reason && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Reason</Label>
              <p className="text-sm">{leave.reason}</p>
            </div>
          )}

          {/* Attachment */}
          {leave.attachmentUrl && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="size-4" />
                Attachment Document
              </Label>
              <a
                href={leave.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <FileText className="size-4" />
                View Document
              </a>
            </div>
          )}

          {/* Working Days Breakdown */}
          {leave.dayBreakdown && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Label className="text-xs text-blue-900 font-medium block mb-2">
                Leave Duration Breakdown
              </Label>
              <div className="text-sm text-blue-800 space-y-1">
                {leave.dayBreakdown && JSON.parse(leave.dayBreakdown)?.summary && (
                  <div>{JSON.parse(leave.dayBreakdown).summary}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {leave.status === 'Pending' && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={loading}>
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={loading}>
                {loading ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          )}

          {leave.status !== 'Pending' && (
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
