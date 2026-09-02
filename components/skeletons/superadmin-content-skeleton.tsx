// Plain CSS skeleton (no third-party web component dependency) used as the
// Suspense fallback for the Superadmin overview content.
export function SuperadminContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 bg-skeleton rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-7 w-40 bg-skeleton rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-skeleton rounded animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="border border-border rounded-lg p-6 space-y-2">
            <div className="h-4 w-24 bg-skeleton rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-skeleton rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg p-6 space-y-3">
        <div className="h-5 w-40 bg-skeleton rounded animate-pulse"></div>
        <div className="h-4 w-full bg-skeleton rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((col) => (
          <div key={col} className="border border-border rounded-lg p-6 space-y-3 min-h-[400px]">
            <div className="h-5 w-32 bg-skeleton rounded animate-pulse"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg border border-border p-3 space-y-2">
                <div className="h-4 w-24 bg-skeleton rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-skeleton rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
