'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function StructureLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Management Structure</h1>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg p-6 h-96">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-24 font-semibold">Section {i}</div>
                <button className="h-8 w-20 rounded-md">Add</button>
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted"></div>
                      <div className="h-4 w-32">Item {j}</div>
                    </div>
                    <button className="h-6 w-6 rounded-md">⋯</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
