'use client'

export function EmployeesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-skeleton rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-skeleton rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2">
            <div className="h-4 w-20 bg-skeleton rounded animate-pulse"></div>
            <div className="h-6 w-16 bg-skeleton rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-4">
              <div className="h-8 w-full bg-skeleton rounded animate-pulse"></div>
              <div className="h-8 w-full bg-skeleton rounded animate-pulse"></div>
              <div className="h-8 w-full bg-skeleton rounded animate-pulse"></div>
              <div className="h-8 w-full bg-skeleton rounded animate-pulse"></div>
              <div className="h-8 w-full bg-skeleton rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
