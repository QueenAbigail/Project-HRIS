'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X, ChevronsUpDown, Check } from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface LeaveHeaderProps {
  isClient?: boolean
}

interface LeaveType {
  value: string
  label: string
}

interface Department {
  value: string
  label: string
}

interface Employee {
  id: string
  name: string
  employeeCode?: string
  email?: string
}

export function LeaveHeader({ isClient = false }: LeaveHeaderProps) {
  const [openNewRequest, setOpenNewRequest] = useState(false)
  const [openImageZoom, setOpenImageZoom] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [employeeSearchValue, setEmployeeSearchValue] = useState('')
  const [formData, setFormData] = useState({
    userId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingFilters, setLoadingFilters] = useState(true)
  const [loadingEmployees, setLoadingEmployees] = useState(false)

  // Fetch leave types and departments
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [typesRes, deptsRes] = await Promise.all([
          fetch('/api/leaves/types'),
          fetch('/api/departments'),
        ])

        if (typesRes.ok) {
          const types = await typesRes.json()
          setLeaveTypes(types)
        } else {
          console.error('[v0] Leave types fetch failed:', typesRes.status, await typesRes.text())
        }

        if (deptsRes.ok) {
          const depts = await deptsRes.json()
          setDepartments(depts)
        } else {
          console.error('[v0] Departments fetch failed:', deptsRes.status, await deptsRes.text())
        }
      } catch (error) {
        console.error('[v0] Failed to fetch filters:', error)
      } finally {
        setLoadingFilters(false)
      }
    }

    fetchFilters()
  }, [])

  // Fetch employees when modal opens
  useEffect(() => {
    if (!openNewRequest) return

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true)
        const response = await fetch('/api/employees/list')
        if (response.ok) {
          const data = await response.json()
          setEmployees(data)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch employees:', error)
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchEmployees()
  }, [openNewRequest])

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearchValue) return employees
    const query = employeeSearchValue.toLowerCase()
    return employees.filter(
      (emp) =>
        emp.employeeCode?.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query)
    )
  }, [employeeSearchValue, employees])

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedEmployee = employees.find((emp) => emp.id === employeeId)
    if (selectedEmployee) {
      setFormData((prev) => ({ ...prev, userId: employeeId }))
      setEmployeeSearchValue(`${selectedEmployee.employeeCode || ''} - ${selectedEmployee.name}`)
    }
    setComboboxOpen(false)
  }

  // Hardcoded multiple approval requests data (will be fetched from database later)


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userId || !formData.leaveType || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
          status: 'Approved', // Admin can directly approve
        }),
      })

      if (response.ok) {
        alert('Leave request created successfully')
        setFormData({ userId: '', leaveType: '', startDate: '', endDate: '', reason: '' })
        setEmployeeSearchValue('')
        setOpenNewRequest(false)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Failed to create leave request'}`)
      }
    } catch (error) {
      console.error('[v0] Error submitting leave request:', error)
      alert('Failed to submit leave request')
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
                <Label>Select Employee *</Label>
                {loadingEmployees ? (
                  <div className="flex items-center justify-center h-10 bg-muted/20 rounded-lg text-sm text-muted-foreground">
                    Loading employees...
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
                        <span className={cn('truncate', !formData.userId && 'text-muted-foreground')}>
                          {formData.userId
                            ? (() => {
                                const emp = employees.find((e) => e.id === formData.userId)
                                return emp ? `${emp.employeeCode || ''} - ${emp.name}`.trim() : 'Select employee...'
                              })()
                            : 'Search by ID or name...'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search by ID or name..."
                          value={employeeSearchValue}
                          onValueChange={setEmployeeSearchValue}
                          className="border-none focus:ring-0"
                        />
                        <CommandList className="max-h-[200px]">
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
                                    formData.userId === employee.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col gap-1 flex-1">
                                  <span className="text-sm font-medium">{employee.employeeCode} - {employee.name}</span>
                                  {employee.email && <span className="text-xs text-muted-foreground">{employee.email}</span>}
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

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select value={formData.leaveType} onValueChange={(value) => setFormData(prev => ({ ...prev, leaveType: value }))}>
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
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
          <Select defaultValue="all-types" disabled={loadingFilters}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {leaveTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="all-dept" disabled={loadingFilters}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-dept">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


    </div>
  )
}
