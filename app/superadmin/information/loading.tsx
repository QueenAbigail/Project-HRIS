'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function InformationLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Settings form */}
      <div className="border border-border rounded-lg p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>

        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  )
}
