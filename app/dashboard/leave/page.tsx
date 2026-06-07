export const dynamic = 'force-dynamic'

import { LeaveHeader } from '@/components/leave/leave-header'
import { LeaveStats } from '@/components/leave/leave-stats'
import { LeaveRequestsTable } from '@/components/leave/leave-requests-table'
import { LeaveBalance } from '@/components/leave/leave-balance'

export default function LeavePage() {
  return (
    <div className="space-y-6">
      <LeaveHeader />
      <LeaveStats />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeaveRequestsTable />
        </div>
        <div className="lg:col-span-1">
          <LeaveBalance />
        </div>
      </div>
    </div>
  )
}
