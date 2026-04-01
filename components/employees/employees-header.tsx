'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function EmployeesHeader() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your security personnel and team members
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" />
          Add Employee
        </Button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 size-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>All Employees</DropdownMenuItem>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>On Leave</DropdownMenuItem>
              <DropdownMenuItem>Inactive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>All Locations</DropdownMenuItem>
              <DropdownMenuItem>Head Office</DropdownMenuItem>
              <DropdownMenuItem>Plaza Tower - Downtown</DropdownMenuItem>
              <DropdownMenuItem>Riverside Mall</DropdownMenuItem>
              <DropdownMenuItem>Metro Bank - Central</DropdownMenuItem>
              <DropdownMenuItem>Corporate Center - North</DropdownMenuItem>
              <DropdownMenuItem>Industrial Park - West</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Field Security</DropdownMenuItem>
              <DropdownMenuItem>Surveillance</DropdownMenuItem>
              <DropdownMenuItem>Administration</DropdownMenuItem>
              <DropdownMenuItem>Patrol</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}
