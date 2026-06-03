'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function SettingsLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Settings</h1>
          <p className="h-4 w-96 text-muted-foreground">Configure your profile and preferences</p>
        </div>

        {/* Settings form sections */}
        <div className="space-y-6">
          {[1, 2, 3].map((section) => (
            <div key={section} className="border border-border rounded-lg p-6 space-y-4">
              <div className="h-6 w-40 font-semibold">Section Title</div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <label className="h-4 w-24 text-sm">Setting Label</label>
                    <input className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
              <button className="h-10 w-20 rounded-md">Save</button>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
