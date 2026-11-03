'use client'

import MapSitesView from '@/components/map-sites/map-sites-view'

export default function MapSitesPage() {
  return (
    <div className="flex min-h-[560px] flex-col gap-3 p-4 md:h-[calc(100dvh-6rem)] md:p-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-lg font-semibold leading-tight text-foreground">All Sites Map View</h1>
        <p className="text-sm text-muted-foreground">Pinpoint locations of all security company sites</p>
      </div>
      <MapSitesView />
    </div>
  )
}
