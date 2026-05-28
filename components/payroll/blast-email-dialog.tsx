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
import { Mail, Send, Users, Search, X } from 'lucide-react'
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

export function BlastEmailDialog({ open, onOpenChange }: BlastEmailDialogProps) {
  const [selectedSite, setSelectedSite] = useState('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachPayslip, setAttachPayslip] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [openRecipientDrawer, setOpenRecipientDrawer] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const getEmployeesBySite = () => {
    if (selectedSite === 'all') {
      return mockEmployees
    }
    return mockEmployees.filter(emp => emp.site === selectedSite)
  }

  const employees = getEmployeesBySite()

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    const eligibleEmployees = employees.filter(emp => !emp.payslipSentThisMonth)
    if (selectedEmployees.length === eligibleEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(eligibleEmployees.map(emp => emp.id))
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
    setSelectedEmployees([])
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
            <Mail className="size-5" />
            Blast Email to Employees
          </DialogTitle>
          <DialogDescription>
            Send payroll-related emails to employees. Select recipients and compose your message.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4 max-h-[400px] overflow-y-auto">
          {/* Left Column - Recipients */}
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
                onClick={() => setOpenRecipientDrawer(true)}
                className="h-6 px-2 text-xs mt-2"
              >
                <>
                  <Search className="size-3 mr-1" />
                  View Recipients
                </>
              </Button>
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
                rows={6}
                className="resize-none"
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
                View and manage email recipients from the selected site
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
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="border-b bg-muted">
                      <th className="px-4 py-2 text-left w-8 bg-muted">
                        <Checkbox
                          checked={selectedEmployees.length === filteredEmployees.filter(e => !e.payslipSentThisMonth).length && filteredEmployees.filter(e => !e.payslipSentThisMonth).length > 0}
                          onCheckedChange={toggleAllEmployees}
                        />
                      </th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted">Name</th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted">Email</th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted">Status</th>
                      <th className="px-4 py-2 text-left font-semibold bg-muted">Payslip Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id} className={`border-b hover:bg-muted/50 transition-colors ${employee.payslipSentThisMonth ? 'bg-muted/30' : ''}`}>
                          <td className="px-4 py-2">
                            <Checkbox
                              checked={selectedEmployees.length === 0 || selectedEmployees.includes(employee.id)}
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
