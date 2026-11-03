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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Mail, Send, Smartphone, Users, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { defaultEmailTemplates } from '@/lib/email-templates'

interface BlastEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siteName: string
}

// Mock employee data
const mockEmployees = [
  { id: 1, name: 'Michael Chen', email: 'michael.chen@company.com', site: 'jakarta', status: 'Active', payslipSentThisMonth: true },
  { id: 2, name: 'Sarah Williams', email: 'sarah.williams@company.com', site: 'jakarta', status: 'Active', payslipSentThisMonth: false },
  { id: 3, name: 'John Rodriguez', email: 'john.rodriguez@company.com', site: 'jakarta', status: 'Pending', payslipSentThisMonth: true },
  { id: 4, name: 'Emma Johnson', email: 'emma.j@company.com', site: 'jakarta', status: 'Active', payslipSentThisMonth: false },
  { id: 5, name: 'David Park', email: 'david.park@company.com', site: 'bandung', status: 'Active', payslipSentThisMonth: false },
  { id: 6, name: 'Lisa Chen', email: 'lisa.chen@company.com', site: 'bandung', status: 'Active', payslipSentThisMonth: true },
  { id: 7, name: 'Robert Taylor', email: 'robert.taylor@company.com', site: 'bandung', status: 'Inactive', payslipSentThisMonth: false },
  { id: 8, name: 'Maria Santos', email: 'maria.santos@company.com', site: 'surabaya', status: 'Active', payslipSentThisMonth: false },
  { id: 9, name: 'James Wilson', email: 'james.wilson@company.com', site: 'surabaya', status: 'Active', payslipSentThisMonth: true },
  { id: 10, name: 'Anna Lee', email: 'anna.lee@company.com', site: 'surabaya', status: 'Active', payslipSentThisMonth: false },
  { id: 11, name: 'Carlos Martinez', email: 'carlos.martinez@company.com', site: 'medan', status: 'Active', payslipSentThisMonth: true },
  { id: 12, name: 'Nina Patel', email: 'nina.patel@company.com', site: 'medan', status: 'Pending', payslipSentThisMonth: false },
]

export function BlastEmailDialog({ open, onOpenChange, siteName }: BlastEmailDialogProps) {
  const payslipTemplate = defaultEmailTemplates.find(t => t.id === 'payslip')!
  
  const [selectedTemplate, setSelectedTemplate] = useState('payslip')
  const [subject, setSubject] = useState(payslipTemplate.subject)
  const [message, setMessage] = useState(payslipTemplate.message)
  const [sendEmailNotification, setSendEmailNotification] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [openRecipientDrawer, setOpenRecipientDrawer] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>(
    mockEmployees.filter(emp => !emp.payslipSentThisMonth).map(emp => emp.id)
  )
  const [searchQuery, setSearchQuery] = useState('')

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = defaultEmailTemplates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setMessage(template.message)
    }
  }

  const currentSiteId = siteName.toLowerCase().includes('head') ? 'jakarta' : siteName.toLowerCase().includes('regional') ? 'surabaya' : 'bandung'

  const getEmployeesBySite = () => mockEmployees.filter(emp => emp.site === currentSiteId)

  const employees = getEmployeesBySite()

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRecipientCount = () => {
    const eligibleEmployees = employees.filter(emp => !emp.payslipSentThisMonth)
    if (selectedEmployees.length > 0) {
      return selectedEmployees.length
    }
    return eligibleEmployees.length
  }

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const toggleAllEmployees = () => {
    const eligibleEmployees = employees.filter(emp => !emp.payslipSentThisMonth)
    if (selectedEmployees.length === eligibleEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(eligibleEmployees.map(emp => emp.id))
    }
  }

  const handlePublishPayslips = async () => {
    setIsSending(true)
    // Simulate publishing to the mobile app - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSending(false)
    onOpenChange(false)
    // Reset form
    setSelectedTemplate('payslip')
    setSubject(payslipTemplate.subject)
    setMessage(payslipTemplate.message)
    setSelectedEmployees(mockEmployees.filter(emp => !emp.payslipSentThisMonth).map(emp => emp.id))
    setSearchQuery('')
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
            <Smartphone className="size-5" />
            Publish Payslips to Mobile App
          </DialogTitle>
          <DialogDescription>
            Make unsent payslips available in the mobile app. Email notification is optional.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4 max-h-[400px] overflow-y-auto">
          {/* Left Column - Recipients */}
          <div className="space-y-4">
            {/* Recipients */}
            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                {siteName}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-3" />
                <span>{getRecipientCount()} employee(s) will receive this payslip in the mobile app</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpenRecipientDrawer(true)}
                className="h-6 px-2 text-xs mt-2"
              >
                <>
                  <Search className="size-3 mr-1" />
                  View Recipients
                </>
              </Button>
            </div>

            {/* Optional email notification */}
            <div className="flex items-start space-x-2 pt-4 border-t">
              <Checkbox
                id="send-email-notification"
                checked={sendEmailNotification}
                onCheckedChange={(checked) => setSendEmailNotification(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="send-email-notification" className="cursor-pointer text-sm font-normal">
                  Also send an email notification (optional)
                </Label>
                <p className="text-xs text-muted-foreground">The payslip will still be available in the mobile app.</p>
              </div>
            </div>
          </div>

          {/* Optional email notification */}
          <div className="space-y-4">
            {/* Email Template */}
            <div className="space-y-2">
              <Label htmlFor="template">Optional Email Notification</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange} disabled={!sendEmailNotification}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {defaultEmailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!sendEmailNotification || selectedTemplate !== 'custom'}
                className={selectedTemplate !== 'custom' ? 'opacity-60 cursor-not-allowed' : ''}
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
                disabled={!sendEmailNotification || selectedTemplate !== 'custom'}
                rows={5}
                className={`resize-none ${selectedTemplate !== 'custom' ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Recipients Drawer */}
        <Drawer open={openRecipientDrawer} onOpenChange={setOpenRecipientDrawer}>
          <DrawerContent className="max-h-[90vh] flex flex-col">
            <DrawerHeader className="pb-3">
              <DrawerTitle>Select Recipients</DrawerTitle>
              <DrawerDescription>
                View and manage mobile app recipients from this site
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4 flex-1 flex flex-col gap-3 overflow-hidden">
              {/* Search Input */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-muted-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Select All Button */}
              <div className="flex justify-end flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllEmployees}
                >
                  {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {/* Recipients Table */}
              <div className="border rounded-lg overflow-y-auto flex-1">
                <table className="w-full text-sm table-fixed">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left w-12 bg-muted">
                        <Checkbox
                          checked={selectedEmployees.length === filteredEmployees.filter(e => !e.payslipSentThisMonth).length && filteredEmployees.filter(e => !e.payslipSentThisMonth).length > 0}
                          onCheckedChange={toggleAllEmployees}
                        />
                      </th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted">Name</th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted">Email</th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted w-20">Status</th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted w-24">Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id} className={`border-b hover:bg-muted/50 transition-colors ${employee.payslipSentThisMonth ? 'bg-muted/30' : ''}`}>
                          <td className="px-4 py-2">
                            <Checkbox
                              checked={selectedEmployees.includes(employee.id)}
                              onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                              disabled={employee.payslipSentThisMonth}
                            />
                          </td>
                          <td className={`px-4 py-2 ${employee.payslipSentThisMonth ? 'line-through text-muted-foreground' : ''}`}>{employee.name}</td>
                          <td className={`px-4 py-2 ${employee.payslipSentThisMonth ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>{employee.email}</td>
                          <td className="px-4 py-2">
                            <Badge variant="secondary" className={getStatusBadgeColor(employee.status)}>
                              {employee.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant={employee.payslipSentThisMonth ? 'secondary' : 'outline'} className={employee.payslipSentThisMonth ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {employee.payslipSentThisMonth ? '✓ Sent' : 'Not Sent'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePublishPayslips} disabled={isSending}>
            {isSending ? (
              <>Publishing...</>
            ) : (
              <>
                <Smartphone className="mr-2 size-4" />
                Publish Payslips
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
