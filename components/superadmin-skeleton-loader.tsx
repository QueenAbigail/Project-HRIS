export function SuperadminSkeletonLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-border bg-card/50 p-4 space-y-4">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 p-4 h-16 flex items-center gap-4">
          <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
          <div className="ml-auto h-8 w-24 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-hidden">
          {/* Title */}
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-20 bg-muted rounded-lg animate-pulse" />
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
                <div className="h-64 bg-muted rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-lg">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        <span className="text-sm text-muted-foreground ml-2">Loading admin dashboard...</span>
      </div>
    </div>
  )
}
