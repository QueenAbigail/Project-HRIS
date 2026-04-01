import { AttendanceHeader } from '@/components/attendance/attendance-header'
import { AttendanceStats } from '@/components/attendance/attendance-stats'
import { AttendanceTable } from '@/components/attendance/attendance-table'
import { AttendanceCalendar } from '@/components/attendance/attendance-calendar'

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <AttendanceHeader />
      <AttendanceStats />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceTable />
        </div>
        <div className="lg:col-span-1">
          <AttendanceCalendar />
        </div>
      </div>
    </div>
  )
}
