import { StatsCards } from '@/components/dashboard/stats-cards'
import { AttendanceChart } from '@/components/dashboard/attendance-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { UpcomingShifts } from '@/components/dashboard/upcoming-shifts'
import { LeaveRequests } from '@/components/dashboard/leave-requests'
import { PayrollSummary } from '@/components/dashboard/payroll-summary'
import { LocationAttendance } from '@/components/dashboard/location-attendance'
import { LateCheckIns } from '@/components/dashboard/late-checkins'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your security team across all locations.
        </p>
      </div>

      <StatsCards />

      {/* Location-based Attendance Overview */}
      <LocationAttendance />

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <AttendanceChart />
        </div>
        <div className="lg:col-span-3">
          <LateCheckIns />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <UpcomingShifts />
        <LeaveRequests />
        <PayrollSummary />
        <RecentActivity />
      </div>
    </div>
  )
}
