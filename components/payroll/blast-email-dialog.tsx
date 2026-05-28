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
import { Mail, Send, Users } from 'lucide-react'

interface BlastEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const departments = [
  { id: 'all', label: 'All Departments' },
  { id: 'field', label: 'Field Security' },
  { id: 'surveillance', label: 'Surveillance' },
  { id: 'patrol', label: 'Patrol' },
  { id: 'admin', label: 'Administration' },
]

const emailTemplates = [
  { id: 'payslip', label: 'Payslip Notification' },
  { id: 'bonus', label: 'Bonus Announcement' },
  { id: 'deduction', label: 'Deduction Notice' },
  { id: 'custom', label: 'Custom Message' },
]

export function BlastEmailDialog({ open, onOpenChange }: BlastEmailDialogProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState('payslip')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachPayslip, setAttachPayslip] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const handleSendEmail = async () => {
    setIsSending(true)
    // Simulate sending email - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSending(false)
    onOpenChange(false)
    // Reset form
    setSubject('')
    setMessage('')
    setSelectedDepartment('all')
    setSelectedTemplate('payslip')
  }

  const getRecipientCount = () => {
    // Mock data - in production this would come from your backend
    const counts: Record<string, number> = {
      all: 12,
      field: 4,
      surveillance: 3,
      patrol: 3,
      admin: 2,
    }
    return counts[selectedDepartment] || 0
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
              <Label htmlFor="department">Recipients</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-3" />
                <span>{getRecipientCount()} employee(s) will receive this email</span>
              </div>
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
