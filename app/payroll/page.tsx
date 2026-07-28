export const dynamic = 'force-dynamic'

import { PayrollHeader } from '@/components/payroll/payroll-header'
import { PayrollStats } from '@/components/payroll/payroll-stats'
import { DetailedPayrollTable } from '@/components/payroll/detailed-payroll-table'

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <PayrollHeader />
      <PayrollStats />
      <DetailedPayrollTable />
    </div>
  )
}
