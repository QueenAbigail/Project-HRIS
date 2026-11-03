'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { SiteMarkerPopup } from './site-marker-popup'

// Import location data from constants as fallback
import { locationStats as fallbackLocationStats } from '@/lib/constants'

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
  const [locationStats, setLocationStats] = useState<typeof fallbackLocationStats>([])
  const [attendanceStats, setAttendanceStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch sites from database
  useEffect(() => {
    async function fetchSites() {
      try {
        const [sitesResponse, attendanceResponse, siteAttendanceResponse] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/attendance/stats?siteId=all'),
          fetch('/api/map-sites'),
        ])
        const companies = await sitesResponse.json()
        const attendance = await attendanceResponse.json()
        const siteAttendance = siteAttendanceResponse.ok ? await siteAttendanceResponse.json() : {}

        if (attendanceResponse.ok) {
          setAttendanceStats({
            totalEmployees: attendance.totalEmployees ?? 0,
            presentToday: attendance.presentToday ?? 0,
            absentToday: attendance.absentToday ?? 0,
          })
        }
        
        // Build location stats from database sites
        const stats: typeof fallbackLocationStats = []
        
        for (const company of companies) {
          for (const site of company.sites) {
            // Only include sites with coordinates
            if (site.latitude && site.longitude) {
              stats.push({
                id: site.id,
                name: site.name,
                code: site.code,
                centerPoint: {
                  latitude: parseFloat(site.latitude),
                  longitude: parseFloat(site.longitude),
                },
                totalStaff: siteAttendance[site.id]?.totalStaff ?? 0,
                presentCount: siteAttendance[site.id]?.presentCount ?? 0,
                lateCount: siteAttendance[site.id]?.lateCount ?? 0,
                absentCount: Math.max(
                  (siteAttendance[site.id]?.totalStaff ?? 0) - (siteAttendance[site.id]?.presentCount ?? 0),
                  0,
                ),
                notCheckedInCount: 0,
              })
            }
          }
        }
        
        // If no sites with coordinates, use fallback
        setLocationStats(stats.length > 0 ? stats : fallbackLocationStats)
      } catch (error) {
        setLocationStats(fallbackLocationStats)
      } finally {
        setLoading(false)
      }
    }

    fetchSites()
  }, [])

  // Keep the initial view focused on Head Office while preserving the existing zoom level.
  const mapCenter: [number, number] = [-6.2088, 106.8456]

  // Get color based on occupancy rate
  const getMarkerColor = (location: { name: string; presentCount: number; totalStaff: number }) => {
    if (location.name.trim().toLowerCase() === 'head office') return '#22c55e'
    const { presentCount, totalStaff } = location
    if (totalStaff === 0) return '#ef4444' // No staff present means 0% occupancy
    const percentage = (presentCount / totalStaff) * 100
    
    if (percentage >= 80) return '#22c55e' // Green
    if (percentage >= 60) return '#eab308' // Yellow
    if (percentage >= 40) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  // Create custom HTML icon with badge
  const createCustomIcon = (location: any) => {
    const color = getMarkerColor(location)
    
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

  if (typeof window === 'undefined' || loading) {
    return (
      <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Loading map...
      </div>
    )
  }

  const summaryStats = [
    { label: 'Total Sites', value: locationStats.length, className: 'text-foreground' },
    { label: 'Total Staff', value: attendanceStats.totalEmployees, className: 'text-foreground' },
    { label: 'Present Today', value: attendanceStats.presentToday, className: 'text-green-500' },
    { label: 'Absent', value: attendanceStats.absentToday, className: 'text-red-500' },
  ]

  const legendItems = [
    { label: '80% - 100%', color: '#22c55e' },
    { label: '60% - 80%', color: '#eab308' },
    { label: '40% - 60%', color: '#f97316' },
    { label: '0% - 40%', color: '#ef4444' },
  ]

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-lg border border-border">
        <MapContainer 
          center={mapCenter} 
          zoom={7}
          minZoom={3}
          maxZoom={18}
          maxBounds={[[-85.051129, -180], [85.051129, 180]]}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            noWrap={true}
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
                <SiteMarkerPopup
                  name={location.name}
                  code={location.code}
                  latitude={location.centerPoint.latitude}
                  longitude={location.centerPoint.longitude}
                  totalStaff={location.totalStaff}
                  presentCount={location.presentCount}
                  lateCount={location.lateCount}
                  absentCount={location.absentCount}
                  isHeadOffice={location.name.trim().toLowerCase() === 'head office'}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div
          className="pointer-events-none absolute left-14 right-3 top-3 z-[1000] grid grid-cols-2 gap-2 md:grid-cols-4"
          role="group"
          aria-label="Site summary"
        >
          {summaryStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline justify-between rounded-lg border border-white/15 bg-background/50 px-3 py-2 shadow-lg backdrop-blur-md backdrop-saturate-150"
            >
              <span className="text-xs text-foreground/70">{stat.label}</span>
              <span className={`text-lg font-bold leading-none ${stat.className}`}>{stat.value}</span>
            </div>
          ))}
        </div>

        <div
          className="absolute bottom-6 left-3 z-[1000] rounded-lg border border-white/15 bg-background/50 px-3 py-2 shadow-lg backdrop-blur-md backdrop-saturate-150"
          role="group"
          aria-label="Occupancy rate legend"
        >
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
            Occupancy Rate
          </p>
          <ul className="flex flex-col gap-1">
            {legendItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs text-foreground">
                <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
