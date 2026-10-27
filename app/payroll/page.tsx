export const dynamic = 'force-dynamic'

import { PayrollHeader } from '@/components/payroll/payroll-header'
import { PayrollStats } from '@/components/payroll/payroll-stats'

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <PayrollHeader />
      <PayrollStats />
    </div>
  )
}
