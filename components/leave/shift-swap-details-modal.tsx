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
import { ArrowRight } from 'lucide-react'

interface ShiftSwapDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  swap: any
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

export function ShiftSwapDetailsModal({
  isOpen,
  onClose,
  swap,
  onApprove,
  onReject,
}: ShiftSwapDetailsModalProps) {
  const [loading, setLoading] = useState(false)

  if (!swap) return null

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onApprove(swap.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await onReject(swap.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const swapDate = new Date(swap.swapDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statusColor = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  }[swap.status]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shift Swap Request Details</DialogTitle>
          <DialogDescription>Review shift swap request between employees</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Swap Date */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Swap Date</Label>
            <p className="text-sm font-medium">{swapDate}</p>
          </div>

          {/* Site */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Site</Label>
            <p className="text-sm font-medium">{swap.site?.name}</p>
          </div>

          {/* Employees Swap */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
              {/* From Employee */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground block">Employee Requesting</Label>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{swap.employeeFrom?.name}</p>
                  <p className="text-xs text-muted-foreground">{swap.employeeFrom?.employeeCode}</p>
                  <p className="text-xs text-muted-foreground">{swap.employeeFrom?.department}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="bg-background border rounded-full p-2">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* To Employee */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground block">Swap With</Label>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{swap.employeeTo?.name}</p>
                  <p className="text-xs text-muted-foreground">{swap.employeeTo?.employeeCode}</p>
                  <p className="text-xs text-muted-foreground">{swap.employeeTo?.department}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Badge className={`${statusColor} border-0`}>{swap.status}</Badge>
          </div>

          {/* Reason */}
          {swap.reason && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Reason</Label>
              <p className="text-sm">{swap.reason}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <Label className="text-muted-foreground block mb-1">Created</Label>
              <p>{new Date(swap.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground block mb-1">Updated</Label>
              <p>{new Date(swap.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {swap.status === 'Pending' && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Approving...' : 'Approve'}
              </Button>
            </DialogFooter>
          )}

          {swap.status !== 'Pending' && (
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
