export function SuperadminPageLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
      {/* Animated Shield Icon */}
      <div className="relative">
        <div className="absolute inset-0 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-primary/20" />
        </div>
        <svg
          className="w-16 h-16 text-primary animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Switching to Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">Initializing system permissions...</p>
      </div>

      {/* Loading Bar */}
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[shimmer_2s_infinite]" style={{
          backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite'
        }} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
