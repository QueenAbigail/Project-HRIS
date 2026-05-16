'use client'

import { LocationAttendanceStats } from '@/lib/data'
import { MapPin, CheckCircle2, XCircle } from 'lucide-react'

interface AttendanceLocationFilterProps {
  locations: LocationAttendanceStats[]
  selectedLocationId: string | null
  onLocationSelect: (locationId: string | null) => void
}

export function AttendanceLocationFilter({ locations, selectedLocationId, onLocationSelect }: AttendanceLocationFilterProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MapPin className="size-4" />
        Attendance by Location
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <button
            key={location.locationId}
            onClick={() => onLocationSelect(selectedLocationId === location.locationId ? null : location.locationId)}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedLocationId === location.locationId
                ? 'border-primary bg-primary/5'
                : 'border-border bg-secondary/20 hover:border-border/80'
            }`}
          >
            <div className="text-left">
              <p className="text-sm font-medium">{location.locationName}</p>
              <p className="text-xs text-muted-foreground font-mono">{location.locationId}</p>
            </div>
            <div className="text-right flex-shrink-0 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                <div className="text-right">
                  <p className="text-sm font-medium text-success">{location.present}</p>
                  <p className="text-xs text-muted-foreground">attended</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="size-4 text-destructive" />
                <div className="text-right">
                  <p className="text-sm font-medium text-destructive">{location.absent + location.notCheckedIn}</p>
                  <p className="text-xs text-muted-foreground">absent</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
