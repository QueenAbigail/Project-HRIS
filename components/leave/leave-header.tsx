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
  // Hardcoded approval request data (will be fetched from database later)
  const [approvalData] = useState({
    id: 'REQ-001',
    employeeName: 'Robert Taylor',
    employeeId: 'EMP-2024-001',
    department: 'Field Security',
    leaveType: 'Annual Leave',
    startDate: 'Apr 1, 2026',
    endDate: 'Apr 5, 2026',
    reason: 'Family vacation planned for Easter holidays',
    formImageUrl: 'https://images.unsplash.com/photo-1586281380349-2be2979c1f90?w=800&q=80', // Placeholder for form picture
    submittedDate: 'Mar 20, 2026',
    mobileFormData: {
      supervisor: 'John Smith',
      emergencyContact: '+1 (555) 123-4567',
      notes: 'All tasks delegated to team members',
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] New leave request submitted:', formData)
    setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' })
    setOpenNewRequest(false)
  }

  const handleApprove = () => {
    console.log('[v0] Approval request approved:', approvalData.id)
    setOpenRequestApproval(false)
  }

  const handleReject = () => {
    console.log('[v0] Approval request rejected:', approvalData.id)
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
        <div className="flex flex-col gap-2">
          <Dialog open={openNewRequest} onOpenChange={setOpenNewRequest}>
            <DialogTrigger asChild>
              <Button className="w-full">
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
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center gap-4">
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
        </div>
        <Dialog open={openRequestApproval} onOpenChange={setOpenRequestApproval}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <CheckCircle2 className="mr-2 size-4" />
              Request Approval
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Leave Approval Request</DialogTitle>
              <DialogDescription>
                Review the submitted leave request form and mobile app data below. Click Approve or Reject to proceed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Form Picture Section */}
              <div className="space-y-2">
                <Label>Leave Request Form</Label>
                <div className="border rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={approvalData.formImageUrl} 
                    alt="Leave request form" 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              </div>

              {/* Employee Information Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Employee Name</Label>
                  <p className="text-sm font-medium">{approvalData.employeeName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Employee ID</Label>
                  <p className="text-sm font-medium">{approvalData.employeeId}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <p className="text-sm font-medium">{approvalData.department}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Submitted Date</Label>
                  <p className="text-sm font-medium">{approvalData.submittedDate}</p>
                </div>
              </div>

              {/* Leave Details Section */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-sm">Leave Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Leave Type</Label>
                    <p className="text-sm font-medium">{approvalData.leaveType}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Period</Label>
                    <p className="text-sm font-medium">{approvalData.startDate} to {approvalData.endDate}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Reason for Leave</Label>
                  <p className="text-sm">{approvalData.reason}</p>
                </div>
              </div>

              {/* Mobile App Submitted Data */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-sm">Mobile App Data</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Supervisor</Label>
                    <p className="text-sm font-medium">{approvalData.mobileFormData.supervisor}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Emergency Contact</Label>
                    <p className="text-sm font-medium">{approvalData.mobileFormData.emergencyContact}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm">{approvalData.mobileFormData.notes}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <DialogFooter className="gap-2 flex-row justify-end pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenRequestApproval(false)}
                >
                  Close
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleReject}
                >
                  Reject
                </Button>
                <Button 
                  type="button" 
                  onClick={handleApprove}
                >
                  Approve
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
