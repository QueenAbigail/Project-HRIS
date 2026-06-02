'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export function SuperadminSkeleton() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer" duration={1.5}>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Dashboard</h1>
          <p className="h-4 w-96 text-muted-foreground">Welcome to the admin dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-4 border rounded-lg bg-card/50">
              <div className="h-4 w-20 text-sm">Stat {i}</div>
              <div className="h-6 w-16 font-bold">1,234</div>
            </div>
          ))}
        </div>

        {/* Management Client Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-6 w-32 font-semibold">Management</div>
            <div className="h-48 border border-border rounded-lg p-4 bg-card/50"></div>
          </div>
          <div className="space-y-2">
            <div className="h-6 w-32 font-semibold">Clients</div>
            <div className="h-48 border border-border rounded-lg p-4 bg-card/50"></div>
          </div>
        </div>

        {/* Table Section */}
        <div className="space-y-2">
          <div className="h-6 w-40 font-semibold">Recent Activity</div>
          <div className="space-y-2 border rounded-lg p-4 bg-card/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted/50"></div>
            ))}
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
