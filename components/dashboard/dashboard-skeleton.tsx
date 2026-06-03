'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export function DashboardSkeleton() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer" duration={1.5}>
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border border-border rounded-lg">
              <div className="h-4 w-20 font-medium mb-2">Metric Title</div>
              <div className="h-8 w-16 text-2xl font-bold">1234</div>
              <div className="h-3 w-24 text-sm mt-2 text-muted-foreground">+12.5% from last month</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-border rounded-lg p-6 space-y-4">
            <div className="h-6 w-32 font-semibold">Chart Title 1</div>
            <div className="space-y-2 h-64">
              <div className="h-2 w-full rounded bg-muted"></div>
              <div className="h-2 w-full rounded bg-muted"></div>
              <div className="h-2 w-full rounded bg-muted"></div>
              <div className="h-2 w-full rounded bg-muted"></div>
            </div>
          </div>
          <div className="border border-border rounded-lg p-6 space-y-4">
            <div className="h-6 w-40 font-semibold">Chart Title 2</div>
            <div className="space-y-2 h-64">
              <div className="h-2 w-full rounded bg-muted"></div>
              <div className="h-2 w-full rounded bg-muted"></div>
              <div className="h-2 w-full rounded bg-muted"></div>
              <div className="h-2 w-full rounded bg-muted"></div>
            </div>
          </div>
        </div>

        {/* Location Attendance */}
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="h-6 w-48 font-semibold">Location Attendance</div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg border border-border p-3">
                <div className="h-4 w-32 mb-2">Location Name</div>
                <div className="h-3 w-48 text-sm">100 employees checked in</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-6 space-y-4">
              <div className="h-6 w-32 font-semibold">Card {i + 1}</div>
              <div className="space-y-2 h-48">
                <div className="h-2 w-full rounded bg-muted"></div>
                <div className="h-2 w-3/4 rounded bg-muted"></div>
                <div className="h-2 w-full rounded bg-muted"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
