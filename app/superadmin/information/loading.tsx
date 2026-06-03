'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function InformationLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">System Information</h1>
          <p className="h-4 w-96 text-muted-foreground">View system details</p>
        </div>

        {/* Settings form */}
        <div className="border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-3">
            <label className="h-4 w-24 text-sm">Setting 1</label>
            <input className="h-10 w-full rounded-md" />
          </div>

          <div className="space-y-3">
            <label className="h-4 w-20 text-sm">Description</label>
            <textarea className="h-32 w-full rounded-md"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <label className="h-4 w-24 text-sm">Field {i}</label>
                <input className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          <button className="h-10 w-32 rounded-md">Save Changes</button>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
