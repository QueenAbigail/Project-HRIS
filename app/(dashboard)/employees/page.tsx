import { EmployeesTable } from '@/components/employees/employees-table'
import { EmployeesHeader } from '@/components/employees/employees-header'
import { EmployeesStats } from '@/components/employees/employees-stats'

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <EmployeesHeader />
      <EmployeesStats />
      <EmployeesTable />
    </div>
  )
}
