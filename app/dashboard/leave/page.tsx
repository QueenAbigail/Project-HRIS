import { LeaveHeader } from '@/components/leave/leave-header'
import { LeaveStats } from '@/components/leave/leave-stats'
import { LeaveRequestsTable } from '@/components/leave/leave-requests-table'
import { LeaveBalance } from '@/components/leave/leave-balance'
import { getCurrentUser } from '@/lib/system'

export default async function LeavePage() {
  // Get current user to check if CLIENT role
  const currentUser = await getCurrentUser()
  const isClient = currentUser?.role === 'CLIENT'

  return (
    <div className="space-y-6">
      <LeaveHeader isClient={isClient} />
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
