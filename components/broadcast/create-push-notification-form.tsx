'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreatePushNotificationFormProps {
  onSuccess?: () => void
}

type RecipientType = 'PERSONAL' | 'MULTI_SITE' | 'SITE_WIDE' | 'ALL_EMPLOYEE'

export function CreatePushNotificationForm({ onSuccess }: CreatePushNotificationFormProps) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [recipientType, setRecipientType] = useState<RecipientType>('ALL_EMPLOYEE')
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<Array<{ id: string; name: string }>>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [availableEmployees, setAvailableEmployees] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Mock data for now
      setSites([
        { id: '1', name: 'Site A' },
        { id: '2', name: 'Site B' },
        { id: '3', name: 'Site C' },
      ])
      setAvailableEmployees([
        { id: 'e1', name: 'John Doe', code: 'EMP001' },
        { id: 'e2', name: 'Jane Smith', code: 'EMP002' },
        { id: 'e3', name: 'Bob Johnson', code: 'EMP003' },
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAddEmployee = (employee: typeof availableEmployees[0]) => {
    if (!selectedEmployees.find(e => e.id === employee.id)) {
      setSelectedEmployees([...selectedEmployees, { id: employee.id, name: employee.name }])
    }
    setEmployeeSearch('')
    setShowEmployeeDropdown(false)
  }

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(selectedEmployees.filter(e => e.id !== employeeId))
  }

  const filteredEmployees = availableEmployees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.code.toLowerCase().includes(employeeSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }

    if (recipientType === 'PERSONAL' && selectedEmployees.length === 0) {
      toast.error('Please select at least one employee')
      return
    }

    if (recipientType === 'SITE_WIDE' && !selectedSite) {
      toast.error('Please select a site')
      return
    }

    try {
      setIsLoading(true)

      const payload = {
        title,
        message,
        recipientType,
        siteId: recipientType === 'SITE_WIDE' ? selectedSite : null,
        employeeIds: recipientType === 'PERSONAL' || recipientType === 'MULTI_SITE' 
          ? selectedEmployees.map(e => e.id) 
          : null,
      }

      const response = await fetch('/api/broadcast/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to send notification')
      }

      toast.success('Push notification sent successfully')

      // Reset form
      setTitle('')
      setMessage('')
      setRecipientType('ALL_EMPLOYEE')
      setSelectedSite('')
      setSelectedEmployees([])

      onSuccess?.()
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="notif-title">Title *</Label>
        <Input
          id="notif-title"
          placeholder="Notification title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notif-message">Message *</Label>
        <Textarea
          id="notif-message"
          placeholder="Notification message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notif-recipient-type">Recipient Type *</Label>
        <Select value={recipientType} onValueChange={(value) => setRecipientType(value as RecipientType)}>
          <SelectTrigger id="notif-recipient-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERSONAL">Personal (Specific Employees)</SelectItem>
            <SelectItem value="MULTI_SITE">Multi-Site (Specific Employees)</SelectItem>
            <SelectItem value="SITE_WIDE">Site Wide (All employees on selected site)</SelectItem>
            <SelectItem value="ALL_EMPLOYEE">All Employee (All employees)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Site Selection for SITE_WIDE */}
      {recipientType === 'SITE_WIDE' && (
        <div className="space-y-2">
          <Label htmlFor="notif-site-select">Select Site *</Label>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger id="notif-site-select">
              <SelectValue placeholder="Choose a site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map(site => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Employee Selection for PERSONAL and MULTI_SITE */}
      {(recipientType === 'PERSONAL' || recipientType === 'MULTI_SITE') && (
        <div className="space-y-2">
          <Label htmlFor="notif-employee-search">Add Employees *</Label>
          <div className="relative">
            <Input
              id="notif-employee-search"
              type="text"
              placeholder="Search by name or employee code..."
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value)
                setShowEmployeeDropdown(true)
              }}
              onFocus={() => setShowEmployeeDropdown(true)}
              disabled={isLoading}
            />

            {showEmployeeDropdown && employeeSearch && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto z-50 bg-popover border rounded-md shadow-md">
                <div className="p-1">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleAddEmployee(emp)}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm"
                      >
                        {emp.name} ({emp.code})
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No employees found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedEmployees.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-muted rounded">
              {selectedEmployees.map(emp => (
                <Badge key={emp.id} variant="secondary" className="flex gap-1">
                  {emp.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveEmployee(emp.id)}
                    className="hover:opacity-70"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Notification'
        )}
      </Button>
    </form>
  )
}
