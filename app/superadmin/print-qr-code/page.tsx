'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Checkbox,
} from '@/components/ui/checkbox'
import { QRCodeCanvas } from 'qrcode.react'
import { MapPin, Printer, Download, Search, X } from 'lucide-react'

// Mock data matching GPS Locations structure
const mockSites = [
  { id: 'all', name: 'All Sites', code: 'ALL' },
  { id: 'site-1', name: 'Main Gate Site', code: 'MG-01' },
  { id: 'site-2', name: 'Building A', code: 'BA-01' },
  { id: 'site-3', name: 'Building B', code: 'BA-02' },
]

const mockAttendanceLocations: Record<string, Array<any>> = {
  'site-1': [
    { id: 1, name: 'Main Entrance', latitude: '-6.2088', longitude: '106.8456', radius: 50, status: 'Active', code: 'MG-ATT-01' },
    { id: 2, name: 'Back Entrance', latitude: '-6.2095', longitude: '106.8460', radius: 45, status: 'Active', code: 'MG-ATT-02' },
    { id: 3, name: 'Security Booth', latitude: '-6.2100', longitude: '106.8465', radius: 30, status: 'Active', code: 'MG-ATT-03' },
  ],
  'site-2': [
    { id: 4, name: 'Building A Lobby', latitude: '-6.2110', longitude: '106.8470', radius: 60, status: 'Active', code: 'BA-ATT-01' },
    { id: 5, name: 'Floor 1 Reception', latitude: '-6.2115', longitude: '106.8475', radius: 40, status: 'Active', code: 'BA-ATT-02' },
  ],
  'site-3': [
    { id: 6, name: 'Building B Main', latitude: '-6.2120', longitude: '106.8480', radius: 55, status: 'Active', code: 'BB-ATT-01' },
  ],
}

const mockPatrolCheckpoints: Record<string, Array<any>> = {
  'site-1': Array.from({ length: 6 }, (_, i) => ({
    id: i + 1000,
    name: `Checkpoint ${String.fromCharCode(65 + i)}`,
    latitude: String(-6.2088 + (Math.random() * 0.01)).substring(0, 8),
    longitude: String(106.8456 + (Math.random() * 0.01)).substring(0, 9),
    radius: 30 + Math.random() * 20,
    status: 'Active',
    code: `MG-PAT-${String(i + 1).padStart(2, '0')}`,
  })),
  'site-2': Array.from({ length: 5 }, (_, i) => ({
    id: i + 2000,
    name: `Building A Check ${i + 1}`,
    latitude: String(-6.2110 + (Math.random() * 0.01)).substring(0, 8),
    longitude: String(106.8470 + (Math.random() * 0.01)).substring(0, 9),
    radius: 25 + Math.random() * 15,
    status: 'Active',
    code: `BA-PAT-${String(i + 1).padStart(2, '0')}`,
  })),
  'site-3': Array.from({ length: 4 }, (_, i) => ({
    id: i + 3000,
    name: `Building B Check ${i + 1}`,
    latitude: String(-6.2120 + (Math.random() * 0.01)).substring(0, 8),
    longitude: String(106.8480 + (Math.random() * 0.01)).substring(0, 9),
    radius: 28 + Math.random() * 18,
    status: 'Active',
    code: `BB-PAT-${String(i + 1).padStart(2, '0')}`,
  })),
}

interface Location {
  id: number
  name: string
  code: string
  latitude: string
  longitude: string
  radius: number
  status: string
}

export default function PrintQRCodePage() {
  const [selectedSite, setSelectedSite] = useState('all')
  const [locationType, setLocationType] = useState('attendance')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<number[]>([])

  // Get all filtered locations
  const getAllLocations = (): Location[] => {
    let locations: Location[] = []

    if (selectedSite === 'all') {
      Object.entries(locationType === 'attendance' ? mockAttendanceLocations : mockPatrolCheckpoints).forEach(
        ([_siteId, siteLocations]) => {
          locations = [...locations, ...siteLocations]
        }
      )
    } else {
      const siteLocations =
        locationType === 'attendance'
          ? mockAttendanceLocations[selectedSite] || []
          : mockPatrolCheckpoints[selectedSite] || []
      locations = siteLocations
    }

    // Filter by search
    if (searchQuery) {
      locations = locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return locations
  }

  const filteredLocations = getAllLocations()

  const toggleLocationSelection = (id: number) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((locId) => locId !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedLocations.length === filteredLocations.length) {
      setSelectedLocations([])
    } else {
      setSelectedLocations(filteredLocations.map((loc) => loc.id))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadQR = (location: Location) => {
    const qrRef = document.getElementById(`qr-${location.id}`)
    if (qrRef) {
      const canvas = qrRef.querySelector('canvas')
      if (canvas) {
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = url
        link.download = `${location.code}-QR.png`
        link.click()
      }
    }
  }

  const selectedLocationData = filteredLocations.filter((loc) =>
    selectedLocations.includes(loc.id)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Print QR Code</h1>
        <p className="text-muted-foreground mt-2">
          Generate and print QR codes for attendance or patrol locations
        </p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Location Type</label>
              <Select value={locationType} onValueChange={setLocationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Locations</SelectItem>
                  <SelectItem value="patrol">Patrol Checkpoints</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Site Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Search Location</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations List with Selection */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Available Locations ({filteredLocations.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Selected: {selectedLocations.length}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
          >
            {selectedLocations.length === filteredLocations.length
              ? 'Deselect All'
              : 'Select All'}
          </Button>
        </CardHeader>
        <CardContent>
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No locations found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedLocations.includes(location.id)}
                    onCheckedChange={() => toggleLocationSelection(location.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{location.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {location.code} • {location.latitude}, {location.longitude}
                    </div>
                  </div>
                  <Badge variant={location.status === 'Active' ? 'default' : 'secondary'}>
                    {location.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Preview and Print Section */}
      {selectedLocationData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">QR Code Preview</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print QR Codes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3"
              id="qr-code-container"
            >
              {selectedLocationData.map((location) => (
                <div
                  key={location.id}
                  className="border rounded-lg p-4 text-center bg-card print:break-inside-avoid"
                  id={`qr-${location.id}`}
                >
                  <div className="mb-3">
                    <QRCodeCanvas
                      value={JSON.stringify({
                        id: location.id,
                        code: location.code,
                        name: location.name,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        type: locationType,
                      })}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold truncate">{location.code}</div>
                    <div className="text-muted-foreground text-xs line-clamp-2">
                      {location.name}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => handleDownloadQR(location)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedLocationData.length === 0 && filteredLocations.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Select locations from the list above to generate QR codes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
