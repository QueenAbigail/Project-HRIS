'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3 border border-border rounded-lg p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Location Attendance */}
      <div className="border border-border rounded-lg p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* Charts and Late Checkins */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 border border-border rounded-lg p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="lg:col-span-3 border border-border rounded-lg p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-48 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

