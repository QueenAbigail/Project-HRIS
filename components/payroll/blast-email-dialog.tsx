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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail, Send, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BlastEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const sites = [
  { id: 'all', label: 'All Sites' },
  { id: 'jakarta', label: 'Jakarta HQ' },
  { id: 'bandung', label: 'Bandung Branch' },
  { id: 'surabaya', label: 'Surabaya Branch' },
  { id: 'medan', label: 'Medan Branch' },
]

const emailTemplates = [
  { id: 'payslip', label: 'Payslip Notification' },
  { id: 'bonus', label: 'Bonus Announcement' },
  { id: 'deduction', label: 'Deduction Notice' },
  { id: 'custom', label: 'Custom Message' },
]

// Mock employee data
const mockEmployees = [
  { id: 1, name: 'Michael Chen', email: 'michael.chen@company.com', site: 'jakarta', status: 'Active' },
  { id: 2, name: 'Sarah Williams', email: 'sarah.williams@company.com', site: 'jakarta', status: 'Active' },
  { id: 3, name: 'John Rodriguez', email: 'john.rodriguez@company.com', site: 'jakarta', status: 'Pending' },
  { id: 4, name: 'Emma Johnson', email: 'emma.j@company.com', site: 'jakarta', status: 'Active' },
  { id: 5, name: 'David Park', email: 'david.park@company.com', site: 'bandung', status: 'Active' },
  { id: 6, name: 'Lisa Chen', email: 'lisa.chen@company.com', site: 'bandung', status: 'Active' },
  { id: 7, name: 'Robert Taylor', email: 'robert.taylor@company.com', site: 'bandung', status: 'Inactive' },
  { id: 8, name: 'Maria Santos', email: 'maria.santos@company.com', site: 'surabaya', status: 'Active' },
  { id: 9, name: 'James Wilson', email: 'james.wilson@company.com', site: 'surabaya', status: 'Active' },
  { id: 10, name: 'Anna Lee', email: 'anna.lee@company.com', site: 'surabaya', status: 'Active' },
  { id: 11, name: 'Carlos Martinez', email: 'carlos.martinez@company.com', site: 'medan', status: 'Active' },
  { id: 12, name: 'Nina Patel', email: 'nina.patel@company.com', site: 'medan', status: 'Pending' },
]

export function BlastEmailDialog({ open, onOpenChange }: BlastEmailDialogProps) {
  const [selectedSite, setSelectedSite] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState('payslip')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachPayslip, setAttachPayslip] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [expandRecipients, setExpandRecipients] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

  const getEmployeesBySite = () => {
    if (selectedSite === 'all') {
      return mockEmployees
    }
    return mockEmployees.filter(emp => emp.site === selectedSite)
  }

  const employees = getEmployeesBySite()

  const getRecipientCount = () => {
    if (selectedEmployees.length > 0) {
      return selectedEmployees.length
    }
    return employees.length
  }

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const toggleAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(employees.map(emp => emp.id))
    }
  }

  const handleSendEmail = async () => {
    setIsSending(true)
    // Simulate sending email - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSending(false)
    onOpenChange(false)
    // Reset form
    setSubject('')
    setMessage('')
    setSelectedSite('all')
    setSelectedTemplate('payslip')
    setSelectedEmployees([])
    setExpandRecipients(false)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Blast Email to Employees
          </DialogTitle>
          <DialogDescription>
            Send payroll-related emails to employees. Select recipients and compose your message.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left Column - Recipients and Template */}
          <div className="space-y-4">
            {/* Recipients */}
            <div className="space-y-2">
              <Label htmlFor="site">Recipients</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger id="site">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-3" />
                <span>{getRecipientCount()} employee(s) will receive this email</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandRecipients(!expandRecipients)}
                className="h-6 px-2 text-xs mt-2"
              >
                {expandRecipients ? (
                  <>
                    <ChevronUp className="size-3 mr-1" />
                    Hide Recipients
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3 mr-1" />
                    View Recipients
                  </>
                )}
              </Button>
            </div>

            {/* Email Template */}
            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Attach Payslip Option */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox
                id="attach-payslip"
                checked={attachPayslip}
                onCheckedChange={(checked) => setAttachPayslip(checked as boolean)}
              />
              <Label htmlFor="attach-payslip" className="text-sm font-normal cursor-pointer">
                Attach payslip PDF to email
              </Label>
            </div>
          </div>

          {/* Right Column - Subject and Message */}
          <div className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Expandable Recipients Table */}
        {expandRecipients && (
          <div className="border-t pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Recipients</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllEmployees}
                  className="h-7 text-xs"
                >
                  {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="px-3 py-2 text-left w-8">
                        <Checkbox
                          checked={selectedEmployees.length === employees.length && employees.length > 0}
                          onCheckedChange={toggleAllEmployees}
                        />
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-3 py-2">
                          <Checkbox
                            checked={selectedEmployees.length === 0 || selectedEmployees.includes(employee.id)}
                            onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                          />
                        </td>
                        <td className="px-3 py-2">{employee.name}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{employee.email}</td>
                        <td className="px-3 py-2">
                          <Badge variant="secondary" className={getStatusBadgeColor(employee.status)}>
                            {employee.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
