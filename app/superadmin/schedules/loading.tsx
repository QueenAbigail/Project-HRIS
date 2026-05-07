'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function SchedulesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Pattern List */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border p-4">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-1">
                {[...Array(14)].map((_, j) => (
                  <Skeleton key={j} className="w-8 h-10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
