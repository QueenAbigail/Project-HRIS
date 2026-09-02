// Plain CSS skeleton (no third-party web component dependency) used as the
// Suspense fallback for DashboardContent. This renders reliably and instantly
// on every navigation, matching the pattern already proven on the Employees page.
export function DashboardContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-skeleton rounded animate-pulse"></div>
        <div className="h-4 w-80 bg-skeleton rounded animate-pulse"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-border rounded-lg p-6 space-y-3">
            <div className="h-4 w-20 bg-skeleton rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-skeleton rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-skeleton rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg p-6 space-y-4">
        <div className="h-6 w-48 bg-skeleton rounded animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg border border-border p-3 space-y-2">
              <div className="h-4 w-32 bg-skeleton rounded animate-pulse"></div>
              <div className="h-3 w-48 bg-skeleton rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="h-6 w-32 bg-skeleton rounded animate-pulse"></div>
          <div className="h-64 bg-skeleton rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6 space-y-4">
            <div className="h-6 w-36 bg-skeleton rounded animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full bg-skeleton rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="border border-border rounded-lg p-6 space-y-4">
            <div className="h-6 w-36 bg-skeleton rounded animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full bg-skeleton rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
