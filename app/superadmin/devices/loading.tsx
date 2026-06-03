'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DevicesLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="h-8 w-64 text-2xl font-bold">Device Management</h1>
          <p className="h-4 w-96 text-muted-foreground">Manage all devices</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-8 w-12 mb-2 font-bold">123</div>
                <div className="h-4 w-24 text-sm">Stat {i}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <input className="h-10 w-48 rounded-md" placeholder="Search" />
        </div>

        {/* Device List */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 font-semibold">Device {i}</div>
                      <div className="h-4 w-32 text-sm">Device ID: ABC123</div>
                    </div>
                    <div className="h-6 w-20 rounded-full text-xs">Active</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 w-24 text-xs">Location: Office</div>
                    <div className="h-4 w-24 text-xs">Model: Model X</div>
                    <div className="h-4 w-24 text-xs">Status: OK</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
