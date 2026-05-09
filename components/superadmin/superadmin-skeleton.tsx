export function SuperadminSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 p-4 border rounded-lg bg-card/50">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Management Client Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-muted rounded-lg animate-pulse" />
        <div className="space-y-2 border rounded-lg p-4 bg-card/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
