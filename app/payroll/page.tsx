export const dynamic = 'force-dynamic'

import { PayrollHeader } from '@/components/payroll/payroll-header'
import { PayrollStats } from '@/components/payroll/payroll-stats'
import { PayrollOperationsOverview } from '@/components/payroll/payroll-operations-overview'

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <PayrollHeader />
      <PayrollStats />
      <PayrollOperationsOverview />
    </div>
  )
}
