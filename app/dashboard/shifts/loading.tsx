'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function ShiftsLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Shift Assignments</h1>
          <p className="h-4 w-96 text-muted-foreground">Manage employee shift schedules</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="h-10 w-full rounded-md" placeholder="Search" />
          <select className="h-10 w-full rounded-md"><option>Department</option></select>
          <select className="h-10 w-full rounded-md"><option>Week</option></select>
          <button className="h-10 w-full rounded-md">Add Shift</button>
        </div>

        {/* Shifts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="h-6 w-24 font-semibold">Shift A</div>
              <div className="h-4 w-32 text-sm">8:00 AM - 4:00 PM</div>
              <div className="h-4 w-40 text-sm">Assigned: 8 employees</div>
              <button className="h-10 w-full rounded-md">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
