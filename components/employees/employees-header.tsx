'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Upload } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { NewEmployee } from './add-employee-dialog'
import { AddEmployeeDialog } from './add-employee-dialog'

interface EmployeesHeaderProps {
  onAddEmployee?: (employee: NewEmployee) => void
  onImportEmployees?: (employees: NewEmployee[]) => void
}

export function EmployeesHeader({ onAddEmployee, onImportEmployees }: EmployeesHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your security personnel and team members
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => {
                setDialogOpen(true)
              }}
            >
              <Upload className="mr-2 size-4" />
              Import
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>
      
      <AddEmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddEmployee={onAddEmployee}
        onImportEmployees={onImportEmployees}
      />
    </>
  )
}
