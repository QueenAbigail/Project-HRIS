'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'

interface AttendanceMapProps {
  lat: number
  lng: number
  label: string
  markerColor?: string
}

export default function AttendanceMap({ lat, lng, label, markerColor = '#3b82f6' }: AttendanceMapProps) {
  // Fix Leaflet marker icon on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    }
  }, [])

  // Create marker icon with custom color
  const markerIcon = useMemo(() => {
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${markerColor}" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12c0 6 10 13 10 13s10-7 10-13c0-5.52-4.48-10-10-10z"/></svg>`
    const encoded = btoa(svgString)
    
    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${encoded}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }, [markerColor])

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border bg-muted [&_script]:hidden" suppressHydrationWarning>
      <MapContainer 
        center={[lat, lng]} 
        zoom={18} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>
            <div className="text-center text-xs">
              <p className="font-semibold">{label}</p>
              <p className="text-muted-foreground">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
