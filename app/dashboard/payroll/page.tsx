import { PayrollHeader } from '@/components/payroll/payroll-header'
import { PayrollStats } from '@/components/payroll/payroll-stats'
import { DetailedPayrollTable } from '@/components/payroll/detailed-payroll-table'
import { PayrollChart } from '@/components/payroll/payroll-chart'

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <PayrollHeader />
      <PayrollStats />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DetailedPayrollTable />
        </div>
        <div className="lg:col-span-2">
          <PayrollChart />
        </div>
      </div>
    </div>
  )
}
