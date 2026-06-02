'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function ReportsLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Reports</h1>
          <p className="h-4 w-96 text-muted-foreground">View and analyze business reports</p>
        </div>

        {/* Date range picker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="h-10 w-full rounded-md" placeholder="Start Date" />
          <input className="h-10 w-full rounded-md" placeholder="End Date" />
          <button className="h-10 w-full rounded-md">Generate Report</button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-2">
              <div className="h-4 w-24 text-sm">Metric</div>
              <div className="h-8 w-16 font-bold text-lg">1,234</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="h-6 w-32 font-semibold mb-4">Chart {i}</div>
              <div className="h-80 w-full bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Report table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="h-8 w-full">Column 1</div>
                <div className="h-8 w-full">Column 2</div>
                <div className="h-8 w-full">Column 3</div>
                <div className="h-8 w-full">Column 4</div>
                <div className="h-8 w-full">Column 5</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
