'use client'

import { useState, useMemo } from 'react'
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
import { Clock, Check, ChevronsUpDown } from 'lucide-react'
import { locations, employeeSchedules } from '@/lib/constants'
import { cn } from '@/lib/utils'

type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'not-checked-in'

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
  name: string
  displayText: string
  defaultSite: string
}

export function MarkAttendanceDialog() {
  const [open, setOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [formData, setFormData] = useState<MarkAttendanceFormData>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    location: 'HO',
    status: 'present',
    checkInTime: '06:00',
    checkOutTime: '14:00',
    notes: '',
  })

  // Convert employee schedules to combobox options
  const employeeOptions: EmployeeOption[] = useMemo(() => {
    return employeeSchedules.map((schedule) => ({
      id: schedule.employeeId,
      name: schedule.employeeName,
      displayText: `${schedule.employeeId} - ${schedule.employeeName} - ${locations.find((l) => l.id === schedule.locationId)?.name || schedule.locationId}`,
      defaultSite: schedule.locationId,
    }))
  }, [])

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchValue) return employeeOptions
    const query = searchValue.toLowerCase()
    return employeeOptions.filter(
      (emp) =>
        emp.id.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query)
    )
  }, [searchValue, employeeOptions])

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
    const selectedEmployee = employeeOptions.find((emp) => emp.id === employeeId)
    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        employeeId: selectedEmployee.id,
        location: selectedEmployee.defaultSite,
      }))
      setSearchValue(selectedEmployee.displayText)
    }
    setComboboxOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Mark Attendance submitted:', formData)
    // TODO: Submit to API
    setOpen(false)
    setFormData({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      location: 'HO',
      status: 'present',
      checkInTime: '06:00',
      checkOutTime: '14:00',
      notes: '',
    })
    setSearchValue('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
          <Clock className="mr-2 size-4" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Record attendance for an employee. Fill in the required fields to mark their attendance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Combobox */}
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {formData.employeeId
                    ? employeeOptions.find((emp) => emp.id === formData.employeeId)
                        ?.displayText
                    : 'Select employee...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search by ID or name..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      {filteredEmployees.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={`${employee.id} ${employee.name}`}
                          onSelect={handleEmployeeSelect}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              formData.employeeId === employee.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {employee.displayText}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Location and Status - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleSelectChange('location', value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleSelectChange('status', value as AttendanceStatus)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Check-in and Check-out Times - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check-in Time</Label>
              <Input
                id="checkInTime"
                name="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check-out Time</Label>
              <Input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional notes or comments..."
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
            >
              Save Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
