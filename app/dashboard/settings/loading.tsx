'use client'

import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Settings form sections */}
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section} className="border border-border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
