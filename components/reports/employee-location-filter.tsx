'use client'

import { LocationAttendanceStats } from '@/lib/data'
import { MapPin, Users } from 'lucide-react'

interface EmployeeLocationFilterProps {
  locations: LocationAttendanceStats[]
  selectedLocationId: string | null
  onLocationSelect: (locationId: string | null) => void
}

export function EmployeeLocationFilter({ locations, selectedLocationId, onLocationSelect }: EmployeeLocationFilterProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MapPin className="size-4" />
        Employees by Location
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
            <div className="text-right flex-shrink-0 flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{location.totalStaff}</p>
                <p className="text-xs text-muted-foreground">employees</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
