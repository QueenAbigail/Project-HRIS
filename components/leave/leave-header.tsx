'use client'

import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LeaveHeader() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Review and manage employee leave requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 size-4" />
            New Request
          </Button>
        </div>
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
      </div>
    </div>
  )
}
