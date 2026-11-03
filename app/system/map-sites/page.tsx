'use client'

import MapSitesView from '@/components/map-sites/map-sites-view'

export default function MapSitesPage() {
  return (
    <div className="flex min-h-[560px] flex-col px-4 pb-4 pt-1 md:h-[calc(100dvh-6rem)] md:px-6 md:pb-6 md:pt-2">
      <MapSitesView />
    </div>
  )
}
