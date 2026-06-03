'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function GPSLocationsLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-9 w-64 text-3xl font-bold">GPS Locations</h1>
          <p className="h-4 w-96 text-muted-foreground">Manage GPS tracking points</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-48 font-semibold">Location {i}</div>
                    <div className="h-4 w-64 text-sm">Coordinates here</div>
                  </div>
                  <button className="h-9 w-20 rounded-md">Edit</button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <input className="h-10 w-full rounded-md" placeholder="Latitude" />
                  <input className="h-10 w-full rounded-md" placeholder="Longitude" />
                  <input className="h-10 w-full rounded-md" placeholder="Name" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
