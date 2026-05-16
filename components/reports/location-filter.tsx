'use client'

import { LocationAttendanceStats } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'

interface LocationFilterProps {
  locations: LocationAttendanceStats[]
  selectedLocationId: string | null
  onLocationSelect: (locationId: string | null) => void
}

export function LocationFilter({ locations, selectedLocationId, onLocationSelect }: LocationFilterProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MapPin className="size-4" />
        Late Check-Ins by Location
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <button
            key={location.locationId}
            onClick={() => onLocationSelect(selectedLocationId === location.locationId ? null : location.locationId)}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedLocationId === location.locationId
                ? 'border-primary bg-primary/5'
                : location.late > 0
                ? 'border-warning/30 bg-warning/5 hover:border-warning/50'
                : 'border-border bg-secondary/20 hover:border-border/80'
            }`}
          >
            <div className="text-left">
              <p className="text-sm font-medium">{location.locationName}</p>
              <p className="text-xs text-muted-foreground font-mono">{location.locationId}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {location.late > 0 ? (
                <>
                  <p className="text-sm font-medium text-warning">{location.late} late</p>
                  <p className="text-xs text-muted-foreground">{location.lateMinutesTotal} min</p>
                </>
              ) : (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  All on time
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
