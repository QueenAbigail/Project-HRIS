'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react'
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

interface LeaveHeaderProps {
  isClient?: boolean
}

export function LeaveHeader({ isClient = false }: LeaveHeaderProps) {
  const [openNewRequest, setOpenNewRequest] = useState(false)
  const [openRequestApproval, setOpenRequestApproval] = useState(false)
  const [openImageZoom, setOpenImageZoom] = useState(false)
  const [currentApprovalIndex, setCurrentApprovalIndex] = useState(0)
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  // Hardcoded multiple approval requests data (will be fetched from database later)
  const [approvalRequests] = useState([
    {
      id: 'REQ-001',
      employeeName: 'Robert Taylor',
      employeeId: 'EMP-2024-001',
      department: 'Field Security',
      leaveType: 'Annual Leave',
      startDate: 'Apr 1, 2026',
      endDate: 'Apr 5, 2026',
      reason: 'Family vacation planned for Easter holidays',
      formImageUrl: '/form-placeholder.png',
      submittedDate: 'Mar 20, 2026',
      mobileFormData: {
        supervisor: 'John Smith',
        emergencyContact: '+1 (555) 123-4567',
        notes: 'All tasks delegated to team members',
      },
    },
    {
      id: 'REQ-002',
      employeeName: 'Jessica Brown',
      employeeId: 'EMP-2024-002',
      department: 'Surveillance',
      leaveType: 'Sick Leave',
      startDate: 'Mar 31, 2026',
      endDate: 'Mar 31, 2026',
      reason: 'Medical appointment and recovery',
      formImageUrl: '/form-placeholder.png',
      submittedDate: 'Mar 21, 2026',
      mobileFormData: {
        supervisor: 'Maria Garcia',
        emergencyContact: '+1 (555) 987-6543',
        notes: 'Doctor certificate provided',
      },
    },
    {
      id: 'REQ-003',
      employeeName: 'Michael Chen',
      employeeId: 'EMP-2024-003',
      department: 'Patrol',
      leaveType: 'Personal Leave',
      startDate: 'Apr 10, 2026',
      endDate: 'Apr 12, 2026',
      reason: 'Personal matters requiring attention',
      formImageUrl: '/form-placeholder.png',
      submittedDate: 'Mar 22, 2026',
      mobileFormData: {
        supervisor: 'David Wilson',
        emergencyContact: '+1 (555) 456-7890',
        notes: 'Coverage arranged with Sarah',
      },
    },
  ])

  const approvalData = approvalRequests[currentApprovalIndex]
  const totalRequests = approvalRequests.length

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
    if (currentApprovalIndex < totalRequests - 1) {
      setCurrentApprovalIndex(currentApprovalIndex + 1)
    } else {
      setOpenRequestApproval(false)
    }
  }

  const handleReject = () => {
    console.log('[v0] Approval request rejected:', approvalData.id)
    if (currentApprovalIndex < totalRequests - 1) {
      setCurrentApprovalIndex(currentApprovalIndex + 1)
    } else {
      setOpenRequestApproval(false)
    }
  }

  const handlePrevious = () => {
    if (currentApprovalIndex > 0) {
      setCurrentApprovalIndex(currentApprovalIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentApprovalIndex < totalRequests - 1) {
      setCurrentApprovalIndex(currentApprovalIndex + 1)
    }
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
          {!isClient && (
            <Dialog open={openNewRequest} onOpenChange={setOpenNewRequest}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="mr-2 size-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit New Leave Request</DialogTitle>
                  <DialogDescription>Fill in the details for your leave request</DialogDescription>
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
          )}
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
        {!isClient && (
          <Dialog open={openRequestApproval} onOpenChange={setOpenRequestApproval}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <CheckCircle2 className="mr-2 size-4" />
                Request Approval
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Approval</DialogTitle>
                <DialogDescription>Review and approve pending leave requests</DialogDescription>
              </DialogHeader>
            
            <div className="space-y-6">
              {/* Form Picture Section */}
              <div className="space-y-2">
                <Label>Leave Request Form</Label>
                <div 
                  className="border rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setOpenImageZoom(true)}
                >
                  <img 
                    src={approvalData.formImageUrl} 
                    alt="Leave request form" 
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Click image to view in full size</p>
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
              <DialogFooter className="gap-2 flex-row justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentApprovalIndex === 0}
                  >
                    <ChevronLeft className="mr-1 size-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentApprovalIndex === totalRequests - 1}
                  >
                    Next
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
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
                </div>
              </DialogFooter>
            </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={openImageZoom} onOpenChange={setOpenImageZoom}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle>Leave Request Form - {approvalData.employeeName}</DialogTitle>
            <button
              onClick={() => setOpenImageZoom(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="w-full flex justify-center">
            <img 
              src={approvalData.formImageUrl} 
              alt="Leave request form - zoomed" 
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
