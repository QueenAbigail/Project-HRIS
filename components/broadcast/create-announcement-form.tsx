'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, FileUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateAnnouncementFormProps {
  onSuccess?: () => void
}

type RecipientType = 'PERSONAL' | 'MULTI_SITE' | 'SITE_WIDE' | 'ALL_EMPLOYEES'

export function CreateAnnouncementForm({ onSuccess }: CreateAnnouncementFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [recipientType, setRecipientType] = useState<RecipientType>('ALL_EMPLOYEES')
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<Array<{ id: string; name: string }>>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [availableEmployees, setAvailableEmployees] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])

  // Fetch data on mount
  useEffect(() => {
    fetchSitesAndEmployees()
  }, [])

  const fetchSitesAndEmployees = async () => {
    try {
      const response = await fetch('/api/broadcast/employees-and-sites')
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const data = await response.json()
      setSites(data.sites)
      setAvailableEmployees(data.employees)
    } catch (error) {
      console.error('[v0] Error fetching data:', error)
      toast.error('Failed to load employees and sites')
    }
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }
      setPdfFile(file)
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

    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required')
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

      // Format form data
      const formData = new FormData()
      formData.append('title', title)
      formData.append('body', body)
      formData.append('recipientType', recipientType)

      if (recipientType === 'SITE_WIDE') {
        formData.append('siteId', selectedSite)
      } else if (recipientType === 'PERSONAL') {
        formData.append('employeeIds', JSON.stringify(selectedEmployees.map(e => e.id)))
      }

      if (pdfFile) {
        formData.append('attachment', pdfFile)
      }

      const response = await fetch('/api/broadcast/announcements', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create announcement')
      }

      const result = await response.json()
      console.log('[v0] Announcement created:', result)
      toast.success(`Announcement created and sent to ${result.recipientCount} recipients`)
      
      // Reset form
      setTitle('')
      setBody('')
      setRecipientType('ALL_EMPLOYEE')
      setSelectedSite('')
      setSelectedEmployees([])
      setPdfFile(null)
      
      onSuccess?.()
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create announcement')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body *</Label>
        <Textarea
          id="body"
          placeholder="Announcement content"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient-type">Recipient Type *</Label>
        <Select value={recipientType} onValueChange={(value) => setRecipientType(value as RecipientType)}>
          <SelectTrigger id="recipient-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERSONAL">Personal (Specific Employees)</SelectItem>
            <SelectItem value="MULTI_SITE">Multi-Site (Specific Employees)</SelectItem>
            <SelectItem value="SITE_WIDE">Site Wide (All employees on selected site)</SelectItem>
            <SelectItem value="ALL_EMPLOYEES">All Employee (All employees)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Site Selection for SITE_WIDE */}
      {recipientType === 'SITE_WIDE' && (
        <div className="space-y-2">
          <Label htmlFor="site-select">Select Site *</Label>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger id="site-select">
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
          <Label htmlFor="employee-search">Add Employees *</Label>
          <div className="relative">
            <Input
              id="employee-search"
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
              <Card className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto z-50">
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
              </Card>
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

      {/* PDF Attachment */}
      <div className="space-y-2">
        <Label htmlFor="pdf-upload">Attachment (PDF only, optional)</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition cursor-pointer">
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handlePdfSelect}
            disabled={isLoading}
            className="hidden"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
            <FileUp className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium">Click to upload PDF</span>
            <span className="text-xs text-muted-foreground">Maximum 10MB</span>
          </label>
        </div>

        {pdfFile && (
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <span className="text-sm">{pdfFile.name}</span>
            <button
              type="button"
              onClick={() => setPdfFile(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Announcement'
        )}
      </Button>
    </form>
  )
}
