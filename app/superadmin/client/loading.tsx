'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function ClientLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="border border-border rounded-lg p-6 h-96">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
