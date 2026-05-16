'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Check, X, Eye, ChevronDown, ChevronUp } from 'lucide-react'

const leaveRequests = [
  {
    id: 1,
    employee: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    location: 'Downtown Site',
    type: 'Annual Leave',
    startDate: 'Apr 1, 2026',
    endDate: 'Apr 5, 2026',
    days: 5,
    reason: 'Family vacation',
    status: 'pending',
    approvals: {
      siteManager: null,
      generalManager: null,
      hrd: null,
      finalApproval: null,
    },
  },
  {
    id: 2,
    employee: 'Jessica Brown',
    initials: 'JB',
    department: 'Surveillance',
    location: 'North Campus',
    type: 'Sick Leave',
    startDate: 'Mar 31, 2026',
    endDate: 'Mar 31, 2026',
    days: 1,
    reason: 'Medical appointment',
    status: 'pending',
    approvals: {
      siteManager: { approvedAt: 'Mar 30, 2026', approvedBy: 'David Lee' },
      generalManager: { approvedAt: 'Mar 30, 2026', approvedBy: 'Jennifer Wong' },
      hrd: { approvedAt: 'Mar 31, 2026', approvedBy: 'Mark Johnson' },
      finalApproval: null,
    },
  },
  {
    id: 3,
    employee: 'Thomas Anderson',
    initials: 'TA',
    department: 'Field Security',
    location: 'West Avenue',
    type: 'Personal',
    startDate: 'Apr 3, 2026',
    endDate: 'Apr 3, 2026',
    days: 1,
    reason: 'Personal matters',
    status: 'pending',
    approvals: {
      siteManager: { approvedAt: 'Mar 29, 2026', approvedBy: 'David Lee' },
      generalManager: null,
      hrd: null,
      finalApproval: null,
    },
  },
  {
    id: 4,
    employee: 'Amanda Martinez',
    initials: 'AM',
    department: 'Administration',
    location: 'Headquarters',
    type: 'Annual Leave',
    startDate: 'Apr 7, 2026',
    endDate: 'Apr 10, 2026',
    days: 4,
    reason: 'Wedding ceremony',
    status: 'approved',
    approvals: {
      siteManager: { approvedAt: 'Mar 25, 2026', approvedBy: 'David Lee' },
      generalManager: { approvedAt: 'Mar 25, 2026', approvedBy: 'Jennifer Wong' },
      hrd: { approvedAt: 'Mar 26, 2026', approvedBy: 'Mark Johnson' },
      finalApproval: { approvedAt: 'Mar 26, 2026', approvedBy: 'Admin User' },
    },
  },
  {
    id: 5,
    employee: 'Michael Chen',
    initials: 'MC',
    department: 'Field Security',
    location: 'East Terminal',
    type: 'Emergency',
    startDate: 'Mar 28, 2026',
    endDate: 'Mar 29, 2026',
    days: 2,
    reason: 'Family emergency',
    status: 'approved',
    approvals: {
      siteManager: { approvedAt: 'Mar 27, 2026', approvedBy: 'David Lee' },
      generalManager: { approvedAt: 'Mar 27, 2026', approvedBy: 'Jennifer Wong' },
      hrd: { approvedAt: 'Mar 27, 2026', approvedBy: 'Mark Johnson' },
      finalApproval: { approvedAt: 'Mar 27, 2026', approvedBy: 'Admin User' },
    },
  },
  {
    id: 6,
    employee: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    location: 'Central Hub',
    type: 'Annual Leave',
    startDate: 'Apr 15, 2026',
    endDate: 'Apr 20, 2026',
    days: 6,
    reason: 'Extended holiday',
    status: 'rejected',
    approvals: {
      siteManager: { approvedAt: 'Apr 1, 2026', approvedBy: 'David Lee' },
      generalManager: { rejectedAt: 'Apr 2, 2026', rejectedBy: 'Jennifer Wong', reason: 'Insufficient coverage' },
      hrd: null,
      finalApproval: null,
    },
  },
]

const statusStyles: Record<string, string> = {
  'pending': 'bg-warning/10 text-warning border-warning/20',
  'approved': 'bg-success/10 text-success border-success/20',
  'rejected': 'bg-destructive/10 text-destructive border-destructive/20',
}

const typeStyles: Record<string, string> = {
  'Annual Leave': 'bg-primary/10 text-primary border-primary/20',
  'Sick Leave': 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  'Personal': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'Emergency': 'bg-destructive/10 text-destructive border-destructive/20',
}

export function LeaveRequestsTable() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<typeof leaveRequests[0] | null>(null)

  const ApprovalBadge = ({ approved, label }: { approved: boolean | null; label: string }) => {
    if (approved === true) {
      return (
        <div className="flex items-center gap-2">
          <Check className="size-4 text-success" />
          <span className="text-xs text-success">{label}</span>
        </div>
      )
    }
    if (approved === false) {
      return (
        <div className="flex items-center gap-2">
          <X className="size-4 text-destructive" />
          <span className="text-xs text-destructive">{label}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <div className="size-4 rounded border border-muted-foreground/50" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Period</TableHead>
                <TableHead className="hidden sm:table-cell">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <>
                  <TableRow key={request.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 p-0"
                        onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                      >
                        {expandedId === request.id ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={`/avatars/${request.id}.jpg`} alt={request.employee} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {request.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.employee}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{request.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {request.location}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeStyles[request.type]}>
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {request.startDate} - {request.endDate}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {request.days}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[request.status]}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="size-7 text-success hover:text-success hover:bg-success/10">
                            <Check className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <AlertDialog open={selectedRequest?.id === request.id} onOpenChange={(open) => setSelectedRequest(open ? request : null)}>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-7">
                              <Eye className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg">Approval Details</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                                <h3 className="font-semibold mb-3">Leave Request Summary</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Employee</p>
                                    <p className="font-medium">{request.employee}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Location</p>
                                    <p className="font-medium">{request.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Leave Type</p>
                                    <p className="font-medium">{request.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Days</p>
                                    <p className="font-medium">{request.days}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">Period</p>
                                    <p className="font-medium">{request.startDate} - {request.endDate}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">Reason</p>
                                    <p className="font-medium">{request.reason}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-4">Approval Chain</h3>
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between p-4 bg-background rounded-lg border border-border hover:bg-muted/30 transition">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                        <p className="text-sm font-semibold">Site Manager</p>
                                        <Badge variant="outline" className="text-xs">Stage 1</Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {request.approvals.siteManager
                                          ? `Approved on ${request.approvals.siteManager.approvedAt} by ${request.approvals.siteManager.approvedBy}`
                                          : 'Awaiting approval'}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {request.approvals.siteManager ? (
                                        <div className="flex items-center gap-2 text-success">
                                          <Check className="size-4" />
                                          <span className="text-xs font-medium">Approved</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <div className="size-4 rounded border border-muted-foreground/50" />
                                          <span className="text-xs font-medium">Pending</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-start justify-between p-4 bg-background rounded-lg border border-border hover:bg-muted/30 transition">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                        <p className="text-sm font-semibold">General Manager</p>
                                        <Badge variant="outline" className="text-xs">Stage 2</Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {request.approvals.generalManager
                                          ? request.approvals.generalManager.approvedAt
                                            ? `Approved on ${request.approvals.generalManager.approvedAt} by ${request.approvals.generalManager.approvedBy}`
                                            : `Rejected on ${request.approvals.generalManager.rejectedAt} by ${request.approvals.generalManager.rejectedBy}`
                                          : 'Awaiting approval'}
                                      </p>
                                      {request.approvals.generalManager?.reason && (
                                        <p className="text-xs text-destructive mt-2">Reason: {request.approvals.generalManager.reason}</p>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      {request.approvals.generalManager ? (
                                        request.approvals.generalManager.approvedAt ? (
                                          <div className="flex items-center gap-2 text-success">
                                            <Check className="size-4" />
                                            <span className="text-xs font-medium">Approved</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2 text-destructive">
                                            <X className="size-4" />
                                            <span className="text-xs font-medium">Rejected</span>
                                          </div>
                                        )
                                      ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <div className="size-4 rounded border border-muted-foreground/50" />
                                          <span className="text-xs font-medium">Pending</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-start justify-between p-4 bg-background rounded-lg border border-border hover:bg-muted/30 transition">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                        <p className="text-sm font-semibold">HRD</p>
                                        <Badge variant="outline" className="text-xs">Stage 3</Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {request.approvals.hrd
                                          ? `Approved on ${request.approvals.hrd.approvedAt} by ${request.approvals.hrd.approvedBy}`
                                          : 'Awaiting approval'}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {request.approvals.hrd ? (
                                        <div className="flex items-center gap-2 text-success">
                                          <Check className="size-4" />
                                          <span className="text-xs font-medium">Approved</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <div className="size-4 rounded border border-muted-foreground/50" />
                                          <span className="text-xs font-medium">Pending</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {request.status !== 'pending' && (
                                <div>
                                  <h3 className="font-semibold mb-3">System Entry</h3>
                                  <div className="flex items-start justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold">Input to System</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {request.approvals.finalApproval
                                          ? `Recorded on ${request.approvals.finalApproval.approvedAt} by ${request.approvals.finalApproval.approvedBy}`
                                          : 'Pending system entry'}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {request.approvals.finalApproval ? (
                                        <div className="flex items-center gap-2 text-success">
                                          <Check className="size-4" />
                                          <span className="text-xs font-medium">Recorded</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-warning">
                                          <div className="size-4 rounded border border-warning/50" />
                                          <span className="text-xs font-medium">Pending</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <AlertDialogCancel>Close</AlertDialogCancel>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedId === request.id && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={8} className="bg-muted/20 px-6 py-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-3">Approval Chain</h4>
                            <div className="space-y-2">
                              <div className="flex items-start justify-between p-3 bg-background rounded-lg border border-border">
                                <div>
                                  <p className="text-sm font-medium">Site Manager</p>
                                  <p className="text-xs text-muted-foreground">
                                    {request.approvals.siteManager
                                      ? `Approved on ${request.approvals.siteManager.approvedAt} by ${request.approvals.siteManager.approvedBy}`
                                      : 'Awaiting approval'}
                                  </p>
                                </div>
                                <ApprovalBadge
                                  approved={request.approvals.siteManager ? true : null}
                                  label="Stage 1"
                                />
                              </div>
                              <div className="flex items-start justify-between p-3 bg-background rounded-lg border border-border">
                                <div>
                                  <p className="text-sm font-medium">General Manager</p>
                                  <p className="text-xs text-muted-foreground">
                                    {request.approvals.generalManager
                                      ? request.approvals.generalManager.approvedAt
                                        ? `Approved on ${request.approvals.generalManager.approvedAt} by ${request.approvals.generalManager.approvedBy}`
                                        : `Rejected on ${request.approvals.generalManager.rejectedAt} by ${request.approvals.generalManager.rejectedBy} - ${request.approvals.generalManager.reason}`
                                      : 'Awaiting approval'}
                                  </p>
                                </div>
                                <ApprovalBadge
                                  approved={
                                    request.approvals.generalManager
                                      ? request.approvals.generalManager.approvedAt
                                        ? true
                                        : false
                                      : null
                                  }
                                  label="Stage 2"
                                />
                              </div>
                              <div className="flex items-start justify-between p-3 bg-background rounded-lg border border-border">
                                <div>
                                  <p className="text-sm font-medium">HRD</p>
                                  <p className="text-xs text-muted-foreground">
                                    {request.approvals.hrd
                                      ? `Approved on ${request.approvals.hrd.approvedAt} by ${request.approvals.hrd.approvedBy}`
                                      : 'Awaiting approval'}
                                  </p>
                                </div>
                                <ApprovalBadge
                                  approved={request.approvals.hrd ? true : null}
                                  label="Stage 3"
                                />
                              </div>
                            </div>
                          </div>
                          {request.status !== 'pending' && (
                            <div>
                              <h4 className="text-sm font-semibold mb-3">Final System Entry</h4>
                              <div className="flex items-start justify-between p-3 bg-background rounded-lg border border-border">
                                <div>
                                  <p className="text-sm font-medium">Input to System</p>
                                  <p className="text-xs text-muted-foreground">
                                    {request.approvals.finalApproval
                                      ? `Recorded on ${request.approvals.finalApproval.approvedAt} by ${request.approvals.finalApproval.approvedBy}`
                                      : 'Pending system entry'}
                                  </p>
                                </div>
                                <ApprovalBadge
                                  approved={request.approvals.finalApproval ? true : null}
                                  label="System"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
