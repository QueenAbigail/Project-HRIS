'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Eye, Pencil, Trash2, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { EmployeeProfileSheet, type Employee } from './employee-profile-sheet'
import { EmployeeEditDialog } from './employee-edit-dialog'
import { NewEmployee } from './add-employee-dialog'

// Generate 200 employees for pagination testing
const departments = ['Field Security', 'Surveillance', 'Administration', 'Patrol', 'VIP Protection']
const positions = ['Security Guard', 'Senior Guard', 'CCTV Operator', 'Control Room Lead', 'Patrol Lead', 'Night Patrol', 'Mobile Patrol', 'VIP Protection', 'HR Coordinator', 'Payroll Specialist']
const locations = [
  { name: 'Head Office', code: 'HO' },
  { name: 'Plaza Tower - Downtown', code: 'PT-DT' },
  { name: 'Riverside Mall', code: 'RM' },
  { name: 'Metro Bank - Central', code: 'MB-CT' },
  { name: 'Corporate Center - North', code: 'CC-N' },
  { name: 'Industrial Park - West', code: 'IP-W' },
]
const statuses = ['active', 'active', 'active', 'active', 'on-leave', 'inactive'] // weighted towards active

const firstNames = ['Michael', 'Sarah', 'David', 'Emily', 'James', 'Robert', 'Jessica', 'Thomas', 'Amanda', 'Kevin', 'Jennifer', 'Daniel', 'Michelle', 'Christopher', 'Lisa', 'Matthew', 'Ashley', 'Andrew', 'Nicole', 'Joshua', 'Stephanie', 'Ryan', 'Heather', 'Brandon', 'Rachel', 'Justin', 'Samantha', 'Brian', 'Megan', 'Eric', 'Laura', 'Steven', 'Rebecca', 'Timothy', 'Brittany', 'Mark', 'Katherine', 'Jason', 'Amber', 'Jeffrey', 'Christina', 'Adam', 'Danielle', 'Nathan', 'Lindsay', 'Zachary', 'Angela', 'Jonathan', 'Chelsea', 'Kyle']
const lastNames = ['Chen', 'Williams', 'Rodriguez', 'Johnson', 'Wilson', 'Taylor', 'Brown', 'Anderson', 'Lee', 'Martinez', 'Garcia', 'Moore', 'Clark', 'Harris', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera']

function generateEmployees(count: number): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`
    const location = locations[Math.floor(Math.random() * locations.length)]
    const dept = departments[Math.floor(Math.random() * departments.length)]
    const pos = positions[Math.floor(Math.random() * positions.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    // Generate random join date between 2019 and 2024
    const year = 2019 + Math.floor(Math.random() * 6)
    const month = Math.floor(Math.random() * 12)
    const day = 1 + Math.floor(Math.random() * 28)
    const joinDate = new Date(year, month, day).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    
    return {
      id: `EMP${String(i + 1).padStart(3, '0')}`,
      name,
      initials: `${firstName[0]}${lastName[0]}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@secureguard.com`,
      department: dept,
      position: pos,
      status,
      joinDate,
      location: location.name,
      locationCode: location.code,
    }
  })
}

const initialEmployees = generateEmployees(200)

const statusStyles: Record<string, string> = {
  'active': 'bg-success/10 text-success border-success/20',
  'on-leave': 'bg-warning/10 text-warning border-warning/20',
  'inactive': 'bg-muted text-muted-foreground border-muted',
}

interface EmployeesTableProps {
  searchQuery?: string
  onAddEmployee?: (employee: NewEmployee) => void
}

export function EmployeesTable({ searchQuery = '' }: EmployeesTableProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees
    
    const query = searchQuery.toLowerCase()
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      emp.location.toLowerCase().includes(query) ||
      emp.id.toLowerCase().includes(query)
    )
  }, [employees, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  // Reset to first page when search changes
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee)
    setProfileOpen(true)
  }

  const handleEditDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditOpen(true)
  }

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    )
    setEditOpen(false)
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id))
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    // Always show first page
    pages.push(1)
    
    if (currentPage > 3) {
      pages.push('...')
    }
    
    // Show pages around current
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Employee Directory</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">Department</TableHead>
                  <TableHead className="hidden xl:table-cell">Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Join Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{employee.id}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{employee.location}</p>
                          <p className="text-xs text-muted-foreground font-mono">{employee.locationCode}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{employee.department}</TableCell>
                    <TableCell className="hidden xl:table-cell">{employee.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[employee.status]}>
                        {employee.status === 'on-leave' ? 'On Leave' : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{employee.joinDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewProfile(employee)}>
                            <Eye className="mr-2 size-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditDetails(employee)}>
                            <Pencil className="mr-2 size-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="icon"
                      className="size-8"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-muted-foreground">
                      {page}
                    </span>
                  )
                ))}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EmployeeProfileSheet
        employee={selectedEmployee}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onEdit={(emp) => {
          setProfileOpen(false)
          handleEditDetails(emp)
        }}
      />

      <EmployeeEditDialog
        employee={selectedEmployee}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveEmployee}
      />
    </>
  )
}
