'use client'

import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'

// Import location data from constants
import { locationStats } from '@/lib/constants'

// Fix Leaflet marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.setIcon(defaultIcon)

export default function MapSitesView() {
  const [selectedSite, setSelectedSite] = useState<string | null>(null)

  // Calculate center of map based on all locations
  const mapCenter = useMemo(() => {
    if (locationStats.length === 0) return [0, 0] as [number, number]
    
    const avgLat = locationStats.reduce((sum, loc) => sum + loc.centerPoint.latitude, 0) / locationStats.length
    const avgLng = locationStats.reduce((sum, loc) => sum + loc.centerPoint.longitude, 0) / locationStats.length
    
    return [avgLat, avgLng] as [number, number]
  }, [])

  // Get color based on occupancy rate
  const getMarkerColor = (presentCount: number, totalStaff: number) => {
    if (totalStaff === 0) return '#999999'
    const percentage = (presentCount / totalStaff) * 100
    
    if (percentage >= 80) return '#22c55e' // Green
    if (percentage >= 60) return '#eab308' // Yellow
    if (percentage >= 40) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  // Create custom HTML icon with badge
  const createCustomIcon = (location: any) => {
    const color = getMarkerColor(location.presentCount, location.totalStaff)
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${location.presentCount}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
      className: 'custom-icon',
    })
  }

  if (typeof window === 'undefined') {
    return <div className="h-96 bg-muted rounded-lg flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="h-96 md:h-[600px] rounded-lg overflow-hidden border border-border">
        <MapContainer 
          center={mapCenter} 
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {locationStats.map((location) => (
            <Marker
              key={location.id}
              position={[location.centerPoint.latitude, location.centerPoint.longitude]}
              icon={createCustomIcon(location)}
              eventHandlers={{
                click: () => setSelectedSite(location.id),
              }}
            >
              <Popup>
                <div className="text-sm font-medium space-y-2 p-2">
                  <h3 className="font-bold text-base">{location.name}</h3>
                  <p className="text-xs text-muted-foreground">{location.code}</p>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between gap-4">
                      <span>Total Staff:</span>
                      <span className="font-semibold">{location.totalStaff}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Present:</span>
                      <span className="font-semibold text-green-600">{location.presentCount}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Late Check-ins:</span>
                      <span className="font-semibold text-orange-600">{location.lateCount}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Absent:</span>
                      <span className="font-semibold text-red-600">{location.absentCount}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Occupancy Rate:</span>
                      <Badge variant="outline">
                        {location.totalStaff > 0 
                          ? Math.round((location.presentCount / location.totalStaff) * 100) 
                          : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold text-sm mb-3">Occupancy Rate Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-xs">80% - 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#eab308' }} />
            <span className="text-xs">60% - 80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span className="text-xs">40% - 60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs">0% - 40%</span>
          </div>
        </div>
      </div>

      {/* Site Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Sites</p>
          <p className="text-2xl font-bold">{locationStats.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Staff</p>
          <p className="text-2xl font-bold">{locationStats.reduce((sum, loc) => sum + loc.totalStaff, 0)}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Present Today</p>
          <p className="text-2xl font-bold text-green-600">{locationStats.reduce((sum, loc) => sum + loc.presentCount, 0)}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Absent</p>
          <p className="text-2xl font-bold text-red-600">{locationStats.reduce((sum, loc) => sum + loc.absentCount, 0)}</p>
        </div>
      </div>
    </div>
  )
}
