'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function AttendanceLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Attendance Records</h1>
          <p className="h-4 w-96 text-muted-foreground">View and manage employee attendance</p>
        </div>

        {/* Filter section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="h-10 w-full rounded-md" placeholder="Search" />
          <select className="h-10 w-full rounded-md"><option>Filter</option></select>
          <select className="h-10 w-full rounded-md"><option>Department</option></select>
          <button className="h-10 w-full rounded-md">Export</button>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="h-8 w-full">Employee Name</div>
                <div className="h-8 w-full">Date</div>
                <div className="h-8 w-full">Clock In</div>
                <div className="h-8 w-full">Clock Out</div>
                <div className="h-8 w-full">Status</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
