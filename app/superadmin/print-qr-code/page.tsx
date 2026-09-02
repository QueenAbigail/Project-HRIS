'use client'

import { useEffect, useState } from 'react'
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
import { MapPin, Printer, Download, Search, X, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { getAttendanceLocations, getPatrolLocations, getAllSites } from '@/app/superadmin/actions'
import { getSystemSettings } from '@/lib/system-settings'
import { toast } from 'sonner'

interface Location {
  id: string
  name: string
  code: string
  latitude: string
  longitude: string
  radius: number
  status: string
  siteId: string
  siteName: string
  siteCode: string
  clientCompanyId?: string
  clientCompanyName?: string
}

interface Site {
  id: string
  name: string
  code: string
}

interface AppSettings {
  appName: string
  appDescription?: string
}

export default function PrintQRCodePage() {
  const [selectedSite, setSelectedSite] = useState('all')
  const [locationType, setLocationType] = useState('attendance')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [layoutOption, setLayoutOption] = useState('a3-3x4')
  const [allAttendanceLocations, setAllAttendanceLocations] = useState<Location[]>([])
  const [allPatrolLocations, setAllPatrolLocations] = useState<Location[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [appSettings, setAppSettings] = useState<AppSettings>({ appName: 'Your Company' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [attendance, patrol, allSites, settings] = await Promise.all([
        getAttendanceLocations(),
        getPatrolLocations(),
        getAllSites(),
        getSystemSettings()
      ])
      
      setAllAttendanceLocations(attendance)
      setAllPatrolLocations(patrol)
      setAppSettings(settings || { appName: 'Your Company' })
      
      // Add 'All Sites' option at the beginning
      setSites([
        { id: 'all', name: 'All Sites', code: 'ALL' },
        ...allSites
      ])
    } catch (error) {
      console.error('[v0] Error loading locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  // Get all filtered locations
  const getAllLocations = (): Location[] => {
    let locations: Location[] = locationType === 'attendance' ? allAttendanceLocations : allPatrolLocations

    // Filter by site
    if (selectedSite !== 'all') {
      locations = locations.filter(loc => loc.siteId === selectedSite)
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

  const toggleLocationSelection = (id: string) => {
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
    const printZone = document.getElementById('qr-print-zone')
    if (!printZone) {
      console.error('[v0] Print zone element not found')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to print QR codes')
      return
    }

    const pageSize = layoutSettings.pageSize === 'A3' ? 'A3 portrait' : 'A4 portrait'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QR Code Print - ${layoutSettings.pageSize}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: 297mm 420mm; 
              margin: 10mm;
            }
            
            body {
              width: 297mm;
              height: 420mm;
              background-color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              overflow: hidden;
            }
            
            #qr-print-zone {
              width: 100%;
              height: 100%;
            }
            
            html {
              background-color: white;
            }
            
            .print-page {
              page-break-after: always;
              background-color: white;
              margin: 0;
              padding: 10mm;
              width: 100%;
              box-sizing: border-box;
            }
            
            .print-page:last-child {
              page-break-after: avoid;
            }
            
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(${layoutSettings.cols}, 1fr);
              gap: ${layoutSettings.spacing === 'gap-3' ? '12px' : layoutSettings.spacing === 'gap-2' ? '8px' : '16px'};
              width: 100%;
            }
            
            .qr-sticker {
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 8px;
              text-align: center;
              background-color: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              aspect-ratio: 1;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .qr-sticker svg {
              max-width: 100%;
              height: auto;
              margin-bottom: 6px;
            }
            
            .qr-label {
              font-size: 8pt;
              line-height: 1.2;
              word-break: break-word;
            }
            
            .qr-code-name {
              font-weight: bold;
              margin-bottom: 2px;
            }
            
            .qr-location-name {
              font-size: 7pt;
              color: #6b7280;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 1;
              -webkit-box-orient: vertical;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
                width: 297mm;
                height: 420mm;
              }
            }
          </style>
        </head>
        <body>
          ${printZone.outerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const handleDownloadQR = (location: Location) => {
    const qrRef = document.getElementById(`qr-${location.id}`)
    if (qrRef) {
      const canvas = qrRef.querySelector('canvas')
      if (canvas) {
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = url
        link.download = `${location.siteName}-${location.name}-${location.code}-QR.png`
        link.click()
      }
    }
  }

  // Get layout settings
  const getLayoutSettings = () => {
    if (layoutOption === 'a3-3x4') {
      return { cols: 3, rows: 4, size: 140, spacing: 'gap-3', pageSize: 'A3' }
    } else if (layoutOption === 'a3-4x5') {
      return { cols: 4, rows: 5, size: 110, spacing: 'gap-2', pageSize: 'A3' }
    } else if (layoutOption === 'a4-2x3') {
      return { cols: 2, rows: 3, size: 120, spacing: 'gap-4', pageSize: 'A4' }
    }
    return { cols: 3, rows: 4, size: 140, spacing: 'gap-3', pageSize: 'A3' }
  }

  const layoutSettings = getLayoutSettings()

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
              <Select value={selectedSite} onValueChange={setSelectedSite} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
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

          {/* Print Layout Options */}
          <div className="border-t pt-4 mt-4">
            <Label className="text-sm font-semibold mb-3 block">Print Layout</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={layoutOption === 'a3-3x4' ? 'default' : 'outline'}
                onClick={() => setLayoutOption('a3-3x4')}
                className="text-sm"
              >
                A3 (3×4 Grid)
              </Button>
              <Button
                variant={layoutOption === 'a3-4x5' ? 'default' : 'outline'}
                onClick={() => setLayoutOption('a3-4x5')}
                className="text-sm"
              >
                A3 (4×5 Grid)
              </Button>
              <Button
                variant={layoutOption === 'a4-2x3' ? 'default' : 'outline'}
                onClick={() => setLayoutOption('a4-2x3')}
                className="text-sm"
              >
                A4 (2×3 Grid)
              </Button>
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
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading locations...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
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
            <div>
              <CardTitle className="text-lg">QR Code Preview</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Paper: {layoutSettings.pageSize} | Grid: {layoutSettings.cols}×{layoutSettings.rows} | Total: {selectedLocationData.length} QR codes
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print QR Codes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* A3/A4 Print-Ready Container */}
            <style>{`
              @media print {
                @page {
                  size: ${layoutSettings.pageSize === 'A3' ? 'A3' : 'A4'};
                  margin: 5mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                .print-page {
                  page-break-after: always;
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: ${layoutSettings.pageSize === 'A3' ? '420mm' : '297mm'};
                }
                .print-page:last-child {
                  page-break-after: avoid;
                }
                .qr-sticker {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
              }
            `}</style>

            <div id="qr-print-zone">
              {/* Create pages based on layout */}
              {Array.from({ length: Math.ceil(selectedLocationData.length / (layoutSettings.cols * layoutSettings.rows)) }).map((_, pageIndex) => {
                const itemsPerPage = layoutSettings.cols * layoutSettings.rows
                const pageItems = selectedLocationData.slice(
                  pageIndex * itemsPerPage,
                  (pageIndex + 1) * itemsPerPage
                )
                return (
                  <div
                    key={pageIndex}
                    className={`print-page border-2 border-dashed rounded-lg mb-4 p-6 print:border-0 print:p-[5mm] print:mb-0 print:rounded-none bg-white`}
                  >
                  <div
                    className={`grid gap-${layoutSettings.spacing === 'gap-3' ? '3' : layoutSettings.spacing === 'gap-2' ? '2' : '4'}`}
                    style={{
                      gridTemplateColumns: `repeat(${layoutSettings.cols}, 1fr)`,
                      gap: layoutSettings.spacing === 'gap-3' ? '12px' : layoutSettings.spacing === 'gap-2' ? '8px' : '16px',
                    }}
                  >
                    {pageItems.map((location) => (
                      <div
                        key={location.id}
                        className="qr-sticker border rounded-lg p-3 text-center bg-white flex flex-col items-center justify-center print:border print:rounded-md print:p-[4mm]"
                        id={`qr-${location.id}`}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                        }}
                      >
                        {/* Service Provider Name (Header) */}
                        <div className="text-[5pt] font-semibold text-gray-600 mb-0.5 truncate w-full print:text-[4pt] tracking-tight">
                          {appSettings.appName}
                        </div>
                        
                        {/* Client Company Name */}
                        <div className="text-[6pt] font-bold text-gray-900 mb-1 truncate w-full print:text-[5pt]">
                          {location.clientCompanyName || location.siteName}
                        </div>
                        
                        {/* QR Code */}
                        <div className="mb-1.5 flex-grow flex items-center justify-center">
                          <QRCodeCanvas
                            value={JSON.stringify({
                              id: location.id,
                              code: location.code,
                              name: location.name,
                              latitude: location.latitude,
                              longitude: location.longitude,
                              type: locationType,
                              site: location.siteName,
                              company: location.clientCompanyName
                            })}
                            size={layoutSettings.size}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        
                        {/* Location Details Label */}
                        <div className="text-xs space-y-0.5 w-full print:text-[8pt]">
                          <div className="font-semibold text-gray-800 truncate text-[6pt]">
                            {location.siteName}
                          </div>
                          <div className="text-gray-600 text-[5pt] line-clamp-1 print:text-[5pt]">
                            {location.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            </div>

            {/* Screen View Only - Show Download Button */}
            <div className="mt-6 pt-6 border-t space-y-3 print:hidden">
              <p className="text-sm text-muted-foreground">Download individual QR codes:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {selectedLocationData.map((location) => (
                  <Button
                    key={location.id}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleDownloadQR(location)}
                    title={`${location.siteName} - ${location.name}`}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {location.siteName}
                  </Button>
                ))}
              </div>
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
