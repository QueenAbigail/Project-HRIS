'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { NewEmployee } from './add-employee-dialog'
import { AddEmployeeDialog } from './add-employee-dialog'

interface EmployeesHeaderProps {
  onAddEmployee?: (employee: NewEmployee) => void
  isClient?: boolean
}

export function EmployeesHeader({ onAddEmployee, isClient = false }: EmployeesHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your security personnel and team members
            </p>
          </div>
          {!isClient && (
            <Button className="w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Employee
            </Button>
          )}
        </div>
      </div>
      
      {!isClient && (
        <AddEmployeeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAddEmployee={onAddEmployee}
        />
      )}
    </>
  )
}
