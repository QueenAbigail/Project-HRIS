'use client'

import { useState } from 'react'
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
import { MoreHorizontal, Eye, Pencil, Trash2, MapPin } from 'lucide-react'
import { EmployeeProfileSheet, type Employee } from './employee-profile-sheet'
import { EmployeeEditDialog } from './employee-edit-dialog'

const employees = [
  {
    id: 'EMP001',
    name: 'Michael Chen',
    initials: 'MC',
    email: 'michael.chen@secureguard.com',
    department: 'Field Security',
    position: 'Senior Guard',
    status: 'active',
    joinDate: 'Jan 15, 2023',
    location: 'Plaza Tower - Downtown',
    locationCode: 'PT-DT',
  },
  {
    id: 'EMP002',
    name: 'Sarah Williams',
    initials: 'SW',
    email: 'sarah.williams@secureguard.com',
    department: 'Surveillance',
    position: 'CCTV Operator',
    status: 'active',
    joinDate: 'Mar 22, 2022',
    location: 'Head Office',
    locationCode: 'HO',
  },
  {
    id: 'EMP003',
    name: 'David Rodriguez',
    initials: 'DR',
    email: 'david.rodriguez@secureguard.com',
    department: 'Patrol',
    position: 'Patrol Lead',
    status: 'on-leave',
    joinDate: 'Sep 10, 2021',
    location: 'Metro Bank - Central',
    locationCode: 'MB-CT',
  },
  {
    id: 'EMP004',
    name: 'Emily Johnson',
    initials: 'EJ',
    email: 'emily.johnson@secureguard.com',
    department: 'Administration',
    position: 'HR Coordinator',
    status: 'active',
    joinDate: 'Feb 05, 2024',
    location: 'Head Office',
    locationCode: 'HO',
  },
  {
    id: 'EMP005',
    name: 'James Wilson',
    initials: 'JW',
    email: 'james.wilson@secureguard.com',
    department: 'Field Security',
    position: 'Security Guard',
    status: 'active',
    joinDate: 'Jul 18, 2023',
    location: 'Riverside Mall',
    locationCode: 'RM',
  },
  {
    id: 'EMP006',
    name: 'Robert Taylor',
    initials: 'RT',
    email: 'robert.taylor@secureguard.com',
    department: 'Patrol',
    position: 'Night Patrol',
    status: 'inactive',
    joinDate: 'Nov 30, 2020',
    location: 'Industrial Park - West',
    locationCode: 'IP-W',
  },
  {
    id: 'EMP007',
    name: 'Jessica Brown',
    initials: 'JB',
    email: 'jessica.brown@secureguard.com',
    department: 'Surveillance',
    position: 'Control Room Lead',
    status: 'active',
    joinDate: 'Apr 12, 2022',
    location: 'Plaza Tower - Downtown',
    locationCode: 'PT-DT',
  },
  {
    id: 'EMP008',
    name: 'Thomas Anderson',
    initials: 'TA',
    email: 'thomas.anderson@secureguard.com',
    department: 'Field Security',
    position: 'VIP Protection',
    status: 'active',
    joinDate: 'Aug 25, 2021',
    location: 'Corporate Center - North',
    locationCode: 'CC-N',
  },
  {
    id: 'EMP009',
    name: 'Amanda Lee',
    initials: 'AL',
    email: 'amanda.lee@secureguard.com',
    department: 'Field Security',
    position: 'Security Guard',
    status: 'active',
    joinDate: 'May 08, 2023',
    location: 'Riverside Mall',
    locationCode: 'RM',
  },
  {
    id: 'EMP010',
    name: 'Kevin Martinez',
    initials: 'KM',
    email: 'kevin.martinez@secureguard.com',
    department: 'Patrol',
    position: 'Mobile Patrol',
    status: 'active',
    joinDate: 'Oct 14, 2022',
    location: 'Metro Bank - Central',
    locationCode: 'MB-CT',
  },
]

const statusStyles: Record<string, string> = {
  'active': 'bg-success/10 text-success border-success/20',
  'on-leave': 'bg-warning/10 text-warning border-warning/20',
  'inactive': 'bg-muted text-muted-foreground border-muted',
}

export function EmployeesTable() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee)
    setProfileOpen(true)
  }

  const handleEditDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setEditOpen(true)
  }

  const handleSaveEmployee = (updatedEmployee: Employee) => {
    // In a real app, this would update the employee in the database
    console.log('Saving employee:', updatedEmployee)
    setEditOpen(false)
  }

  return (
    <>
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
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
              {employees.map((employee) => (
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
                        <DropdownMenuItem className="text-destructive">
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
