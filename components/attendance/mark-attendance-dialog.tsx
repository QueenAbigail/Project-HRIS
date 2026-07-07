'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Clock, Check, ChevronsUpDown, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'NOT_CHECKED_IN'

interface MarkAttendanceFormData {
  employeeId: string
  date: string
  location: string
  status: AttendanceStatus
  checkInTime: string
  checkOutTime: string
  notes: string
}

interface EmployeeOption {
  id: string
  employeeCode: string
  name: string
  email: string
  defaultSite: string
}

interface SiteOption {
  id: string
  name: string
  code: string
}

interface ExistingAttendance {
  hasCheckIn: boolean
  hasCheckOut: boolean
  checkInTime?: string
  checkOutTime?: string
}

export function MarkAttendanceDialog() {
  const [open, setOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [sites, setSites] = useState<SiteOption[]>([])
  const [employeesLoaded, setEmployeesLoaded] = useState(false)
  const [sitesLoaded, setSitesLoaded] = useState(false)
  const [existingAttendance, setExistingAttendance] = useState<ExistingAttendance | null>(null)
  const [checkingAttendance, setCheckingAttendance] = useState(false)

  const [formData, setFormData] = useState<MarkAttendanceFormData>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    status: 'PRESENT',
    checkInTime: '',
    checkOutTime: '',
    notes: '',
  })

  // Load employees and sites on mount or when dialog opens
  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch employees
        if (!employeesLoaded) {
          const empResponse = await fetch('/api/employees/list')
          if (empResponse.ok) {
            const empData = await empResponse.json()
            setEmployees(empData)
            setEmployeesLoaded(true)
          } else {
            setError('Failed to load employees')
          }
        }

        // Fetch sites
        if (!sitesLoaded) {
          const sitesResponse = await fetch('/api/sites/list')
          if (sitesResponse.ok) {
            const sitesData = await sitesResponse.json()
            setSites(sitesData)
            setSitesLoaded(true)
            // Set default location if available
            if (sitesData.length > 0 && !formData.location) {
              setFormData((prev) => ({
                ...prev,
                location: sitesData[0].id,
              }))
            }
          } else {
            setError('Failed to load locations')
          }
        }
      } catch (err) {
        console.error('[v0] Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, employeesLoaded, sitesLoaded, formData.location])

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchValue) return employees
    const query = searchValue.toLowerCase()
    return employees.filter(
      (emp) =>
        emp.employeeCode?.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query)
    )
  }, [searchValue, employees])

  // Check for existing attendance when employee or date changes
  useEffect(() => {
    if (!formData.employeeId || !formData.date) {
      setExistingAttendance(null)
      return
    }

    const checkExistingAttendance = async () => {
      try {
        setCheckingAttendance(true)
        const response = await fetch(
          `/api/attendance/check?employeeId=${formData.employeeId}&date=${formData.date}`
        )
        if (response.ok) {
          const data = await response.json()
          setExistingAttendance(data)
        } else {
          setExistingAttendance(null)
        }
      } catch (err) {
        console.error('[v0] Error checking attendance:', err)
        setExistingAttendance(null)
      } finally {
        setCheckingAttendance(false)
      }
    }

    checkExistingAttendance()
  }, [formData.employeeId, formData.date])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedEmployee = employees.find((emp) => emp.id === employeeId)
    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        employeeId: selectedEmployee.id,
        location: selectedEmployee.defaultSite || prev.location,
      }))
      setSearchValue(`${selectedEmployee.employeeCode} - ${selectedEmployee.name}`)
    }
    setComboboxOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.employeeId || !formData.date || !formData.location || !formData.status) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.employeeId,
          date: formData.date,
          locationId: formData.location,
          status: formData.status,
          checkInTime: formData.checkInTime || undefined,
          checkOutTime: formData.checkOutTime || undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save attendance')
      }

      // Success - close dialog and reset form
      setOpen(false)
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        location: sites.length > 0 ? sites[0].id : '',
        status: 'PRESENT',
        checkInTime: '06:00',
        checkOutTime: '14:00',
        notes: '',
      })
      setSearchValue('')
    } catch (err) {
      console.error('[v0] Error saving attendance:', err)
      setError(err instanceof Error ? err.message : 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Clock className="mr-2 size-4" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">Mark Attendance</DialogTitle>
          <DialogDescription className="text-xs mt-1">
            Create new or update existing attendance records
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="size-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Primary Section: Employee Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Select Employee *</Label>
            {loading && !employeesLoaded ? (
              <div className="flex items-center justify-center h-10 bg-muted/20 rounded-lg">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between h-10 px-3 bg-background hover:bg-muted/50"
                  >
                    <span className={cn('truncate', !formData.employeeId && 'text-muted-foreground')}>
                      {formData.employeeId
                        ? (() => {
                            const emp = employees.find((e) => e.id === formData.employeeId)
                            return emp ? `${emp.employeeCode} - ${emp.name}` : 'Select employee...'
                          })()
                        : 'Search by employee ID or name...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search by ID or name..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="border-none focus:ring-0"
                    />
                    <CommandList className="max-h-[280px]">
                      <CommandEmpty className="py-6 text-center text-xs">No employee found</CommandEmpty>
                      <CommandGroup>
                        {filteredEmployees.map((employee) => (
                          <CommandItem
                            key={employee.id}
                            value={`${employee.employeeCode} ${employee.name}`}
                            onSelect={() => handleEmployeeSelect(employee.id)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.employeeId === employee.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col gap-1 flex-1">
                              <span className="text-sm font-medium">{employee.employeeCode} - {employee.name}</span>
                              <span className="text-xs text-muted-foreground">{employee.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Secondary Section: Date & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleSelectChange('location', value)}
              >
                <SelectTrigger id="location" className="h-9">
                  <SelectValue placeholder="Loading..." />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tertiary Section: Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">Attendance Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleSelectChange('status', value as AttendanceStatus)
              }
            >
              <SelectTrigger id="status" className="h-9">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LEAVE">Leave</SelectItem>
                <SelectItem value="NOT_CHECKED_IN">Not Checked In</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quaternary Section: Time Details */}
          <div className="bg-muted/40 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time Details</p>
            
            {/* Warnings for locked times */}
            {existingAttendance && (existingAttendance.hasCheckIn || existingAttendance.hasCheckOut) && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <AlertCircle className="size-4 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-700 space-y-1">
                  {existingAttendance.hasCheckIn && (
                    <p>Check-in already recorded at {existingAttendance.checkInTime} - cannot be changed</p>
                  )}
                  {existingAttendance.hasCheckOut && (
                    <p>Check-out already recorded at {existingAttendance.checkOutTime} - cannot be changed</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="checkInTime" className="text-xs">
                  Check-in
                  {existingAttendance?.hasCheckIn && <span className="ml-1 text-yellow-600">●</span>}
                </Label>
                <Input
                  id="checkInTime"
                  name="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  disabled={existingAttendance?.hasCheckIn || checkingAttendance}
                  className="h-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="--:--"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="checkOutTime" className="text-xs">
                  Check-out
                  {existingAttendance?.hasCheckOut && <span className="ml-1 text-yellow-600">●</span>}
                </Label>
                <Input
                  id="checkOutTime"
                  name="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  disabled={existingAttendance?.hasCheckOut || checkingAttendance}
                  className="h-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="--:--"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add comments or additional details..."
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-9"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9"
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Attendance'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
