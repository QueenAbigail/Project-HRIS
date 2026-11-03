'use client'

import MapSitesView from '@/components/map-sites/map-sites-view'

export default function MapSitesPage() {
  return (
    <div className="flex min-h-[560px] flex-col p-4 md:h-[calc(100dvh-6rem)] md:p-6">
      <MapSitesView />
    </div>
  )
}
