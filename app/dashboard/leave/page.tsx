import { LeaveHeader } from '@/components/leave/leave-header'
import { LeaveStats } from '@/components/leave/leave-stats'
import { UnifiedRequestsTable } from '@/components/leave/unified-requests-table'
import { getCurrentUser } from '@/lib/system'
import { canManageLeaves } from '@/lib/leave-authorization'

export default async function LeavePage() {
  const currentUser = await getCurrentUser()
  const canCreateLeave = currentUser ? canManageLeaves(currentUser.role) : false

  return (
    <div className="space-y-6">
      <LeaveHeader canCreateLeave={canCreateLeave} />
      <LeaveStats />
      <UnifiedRequestsTable />
    </div>
  )
}
