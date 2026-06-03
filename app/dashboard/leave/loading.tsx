'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function LeaveLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Leave Requests</h1>
          <p className="h-4 w-96 text-muted-foreground">Manage employee leave requests</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="h-10 w-full rounded-md" placeholder="Search" />
          <select className="h-10 w-full rounded-md"><option>Status</option></select>
          <select className="h-10 w-full rounded-md"><option>Month</option></select>
          <button className="h-10 w-full rounded-md">New Request</button>
        </div>

        {/* Leave requests list */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 font-medium">Employee Name</div>
                <div className="h-6 w-20 rounded-full text-xs">Pending</div>
              </div>
              <div className="h-4 w-64 text-sm">Leave Type: Annual Leave</div>
              <div className="h-4 w-48 text-sm">Duration: Jan 1 - Jan 5, 2026</div>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
