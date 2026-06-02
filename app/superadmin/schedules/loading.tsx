'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function SchedulesLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="h-8 w-64 text-2xl font-bold">Schedule Management</h1>
          <p className="h-4 w-96 text-muted-foreground">Manage work schedules</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="h-4 w-24 text-sm">Stat {i}</div>
              <div className="h-8 w-16 font-bold">324</div>
            </div>
          ))}
        </div>

        {/* Pattern List */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="border-b border-border p-4">
            <div className="h-6 w-40 font-semibold">Schedule Patterns</div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-32 font-semibold">Pattern {i}</div>
                  <div className="h-5 w-16 text-xs">8h/day</div>
                </div>
                <div className="h-4 w-48 text-sm">Description here</div>
                <div className="flex gap-1">
                  {[...Array(14)].map((_, j) => (
                    <div key={j} className="w-8 h-10 bg-muted rounded text-xs flex items-center justify-center">D{j}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
