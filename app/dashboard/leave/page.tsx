import { LeaveHeader } from '@/components/leave/leave-header'
import { LeaveStats } from '@/components/leave/leave-stats'
import { LeaveRequestsTable } from '@/components/leave/leave-requests-table'
import { getCurrentUser } from '@/lib/system'

export default async function LeavePage() {
  // Get current user to check if CLIENT role
  const currentUser = await getCurrentUser()
  const isClient = currentUser?.role === 'CLIENT'

  return (
    <div className="space-y-6">
      <LeaveHeader isClient={isClient} />
      <LeaveStats />
      <LeaveRequestsTable />
    </div>
  )
}
