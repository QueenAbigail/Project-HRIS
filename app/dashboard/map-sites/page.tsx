'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MapSitesView from '@/components/map-sites/map-sites-view'

export default function MapSitesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Site Locations Map</h1>
        <p className="text-muted-foreground mt-2">View all site locations on an interactive map with employee statistics</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Sites Map View</CardTitle>
          <CardDescription>Pinpoint locations of all security company sites</CardDescription>
        </CardHeader>
        <CardContent>
          <MapSitesView />
        </CardContent>
      </Card>
    </div>
  )
}
