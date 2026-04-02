'use client'

import { useState } from 'react'
import { EmployeesTable } from '@/components/employees/employees-table'
import { EmployeesHeader } from '@/components/employees/employees-header'
import { EmployeesStats } from '@/components/employees/employees-stats'

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      <EmployeesHeader 
        onSearch={setSearchQuery}
      />
      <EmployeesStats />
      <EmployeesTable searchQuery={searchQuery} />
    </div>
  )
}
