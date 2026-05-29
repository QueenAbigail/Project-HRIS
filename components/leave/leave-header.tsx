'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function LeaveHeader() {
  const [openNewRequest, setOpenNewRequest] = useState(false)
  const [openRequestApproval, setOpenRequestApproval] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [approvalFormData, setApprovalFormData] = useState({
    employeeName: '',
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachmentNote: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleApprovalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setApprovalFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] New leave request submitted:', formData)
    setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' })
    setOpenNewRequest(false)
  }

  const handleApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Approval request submitted:', approvalFormData)
    setApprovalFormData({ employeeName: '', employeeId: '', leaveType: '', startDate: '', endDate: '', reason: '', attachmentNote: '' })
    setOpenRequestApproval(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Review and manage employee leave requests
          </p>
        </div>
        <Dialog open={openNewRequest} onOpenChange={setOpenNewRequest}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
              <DialogDescription>
                Fill in the details below to submit a new leave request for approval.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select value={formData.leaveType} onValueChange={(value) => setFormData(prev => ({ ...prev, leaveType: value }))}>
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Please provide a reason for your leave request..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenNewRequest(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-types">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Leave Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Types</SelectItem>
            <SelectItem value="annual">Annual Leave</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="personal">Personal Leave</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-dept">
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-dept">All Departments</SelectItem>
            <SelectItem value="field">Field Security</SelectItem>
            <SelectItem value="surveillance">Surveillance</SelectItem>
            <SelectItem value="patrol">Patrol</SelectItem>
            <SelectItem value="admin">Administration</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={openRequestApproval} onOpenChange={setOpenRequestApproval}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <CheckCircle2 className="mr-2 size-4" />
              Request Approval
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Leave Approval</DialogTitle>
              <DialogDescription>
                Fill in the employee details and leave information to submit for approval. This will be added to the requests table with pending status.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApprovalSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    name="employeeName"
                    placeholder="Enter employee name"
                    value={approvalFormData.employeeName}
                    onChange={handleApprovalInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    placeholder="Enter employee ID"
                    value={approvalFormData.employeeId}
                    onChange={handleApprovalInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approvalLeaveType">Leave Type</Label>
                <Select value={approvalFormData.leaveType} onValueChange={(value) => setApprovalFormData(prev => ({ ...prev, leaveType: value }))}>
                  <SelectTrigger id="approvalLeaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="approvalStartDate">Start Date</Label>
                  <Input
                    id="approvalStartDate"
                    type="date"
                    name="startDate"
                    value={approvalFormData.startDate}
                    onChange={handleApprovalInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approvalEndDate">End Date</Label>
                  <Input
                    id="approvalEndDate"
                    type="date"
                    name="endDate"
                    value={approvalFormData.endDate}
                    onChange={handleApprovalInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approvalReason">Reason for Leave</Label>
                <Textarea
                  id="approvalReason"
                  name="reason"
                  placeholder="Provide reason for the leave request..."
                  value={approvalFormData.reason}
                  onChange={handleApprovalInputChange}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachmentNote">Attachment/Note</Label>
                <Textarea
                  id="attachmentNote"
                  name="attachmentNote"
                  placeholder="Add any attachments or additional notes..."
                  value={approvalFormData.attachmentNote}
                  onChange={handleApprovalInputChange}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenRequestApproval(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit for Approval</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
