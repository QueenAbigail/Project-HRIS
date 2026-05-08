'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Edit, Trash2, Building2, Search, X } from 'lucide-react'

// Shared sites data - synced between attendance and patrol
const mockSites = [
  { id: 'all', name: 'All Sites', code: 'ALL' },
  { id: 'site-1', name: 'Main Gate Site', code: 'MG-01' },
  { id: 'site-2', name: 'Building A', code: 'BA-01' },
  { id: 'site-3', name: 'Building B', code: 'BA-02' },
]

// Mock attendance locations - organized by site
const mockAttendanceLocations: Record<string, Array<any>> = {
  'site-1': [
    { id: 1, name: 'Main Entrance', latitude: '-6.2088', longitude: '106.8456', radius: 50, status: 'Active' },
    { id: 2, name: 'Back Entrance', latitude: '-6.2095', longitude: '106.8460', radius: 45, status: 'Active' },
    { id: 3, name: 'Security Booth', latitude: '-6.2100', longitude: '106.8465', radius: 30, status: 'Active' },
  ],
  'site-2': [
    { id: 4, name: 'Building A Lobby', latitude: '-6.2110', longitude: '106.8470', radius: 60, status: 'Active' },
    { id: 5, name: 'Floor 1 Reception', latitude: '-6.2115', longitude: '106.8475', radius: 40, status: 'Active' },
  ],
  'site-3': [
    { id: 6, name: 'Building B Main', latitude: '-6.2120', longitude: '106.8480', radius: 55, status: 'Active' },
  ],
}

// Mock patrol checkpoints - organized by site
const mockPatrolCheckpoints: Record<string, Array<any>> = {
  'site-1': Array.from({ length: 17 }, (_, i) => ({
    id: i + 1000,
    name: `Checkpoint ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
    latitude: String(-6.2088 + (Math.random() * 0.01)).substring(0, 8),
    longitude: String(106.8456 + (Math.random() * 0.01)).substring(0, 9),
    radius: 30 + Math.random() * 20,
    status: Math.random() > 0.1 ? 'Active' : 'Inactive',
  })),
  'site-2': Array.from({ length: 12 }, (_, i) => ({
    id: i + 2000,
    name: `Building A Check ${i + 1}`,
    latitude: String(-6.2110 + (Math.random() * 0.01)).substring(0, 8),
    longitude: String(106.8470 + (Math.random() * 0.01)).substring(0, 9),
    radius: 25 + Math.random() * 15,
    status: Math.random() > 0.1 ? 'Active' : 'Inactive',
  })),
  'site-3': Array.from({ length: 9 }, (_, i) => ({
    id: i + 3000,
    name: `Building B Check ${i + 1}`,
    latitude: String(-6.2120 + (Math.random() * 0.01)).substring(0, 8),
    longitude: String(106.8480 + (Math.random() * 0.01)).substring(0, 9),
    radius: 28 + Math.random() * 18,
    status: Math.random() > 0.1 ? 'Active' : 'Inactive',
  })),
}

export default function GPSLocationsPage() {
  const [selectedSite, setSelectedSite] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('attendance')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newLocationData, setNewLocationData] = useState({
    name: '',
    siteId: 'site-1',
    latitude: '',
    longitude: '',
    radius: '50',
  })

  // Filter sites based on selection and search
  const getFilteredSites = () => {
    let filtered = mockSites.filter((s) => s.id !== 'all')
    
    if (selectedSite !== 'all') {
      filtered = filtered.filter((s) => s.id === selectedSite)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  // Get locations for a specific site
  const getAttendanceLocations = (siteId: string) => {
    return mockAttendanceLocations[siteId] || []
  }

  // Get checkpoints for a specific site
  const getPatrolCheckpoints = (siteId: string) => {
    return mockPatrolCheckpoints[siteId] || []
  }

  const filteredSites = getFilteredSites()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GPS Locations</h1>
        <p className="text-muted-foreground mt-2">
          Manage GPS location checkpoints grouped by site for attendance and patrol monitoring
        </p>
      </div>

      {/* Site Filter with Search */}
      <div className="flex items-end gap-3">
        <div className="flex-1 max-w-md">
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2 block">
            <Building2 className="h-4 w-4" />
            Filter by Site
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search site name or code..."
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
        {searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedSite('all')
            }}
          >
            Reset
          </Button>
        )}
      </div>

      <Tabs defaultValue="attendance" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Attendance Locations
          </TabsTrigger>
          <TabsTrigger value="patrol" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Patrol Checkpoints
          </TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Attendance GPS Locations</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Attendance Location</DialogTitle>
                  <DialogDescription>
                    Create a new GPS location for attendance tracking
                  </DialogDescription>
                </DialogHeader>
                <AddLocationForm
                  type="attendance"
                  onClose={() => setIsAddDialogOpen(false)}
                  newLocationData={newLocationData}
                  setNewLocationData={setNewLocationData}
                />
              </DialogContent>
            </Dialog>
          </div>

          {filteredSites.length === 0 ? (
            <Card className="border-border">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No sites available</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredSites.map((site) => {
                const locations = getAttendanceLocations(site.id)
                return (
                  <Card key={site.id} className="border-border">
                    <AccordionItem value={site.id} className="border-0">
                      <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline -mx-6 px-6 py-0">
                          <div className="flex items-center gap-3 flex-1 text-left">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <div>
                              <p className="font-semibold">{site.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {locations.length} location{locations.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent className="pt-0">
                        <CardContent className="space-y-4">
                          {locations.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No attendance locations configured for this site</p>
                          ) : (
                            <div className="rounded-lg border border-border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>Location Name</TableHead>
                                    <TableHead>Radius</TableHead>
                                    <TableHead>Coordinates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {locations.map((location) => (
                                    <TableRow key={location.id}>
                                      <TableCell className="font-medium">{location.name}</TableCell>
                                      <TableCell>{location.radius.toFixed(0)}m</TableCell>
                                      <TableCell className="text-xs font-mono text-muted-foreground">
                                        {location.latitude}, {location.longitude}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={location.status === 'Active' ? 'default' : 'secondary'}>
                                          {location.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        {/* Patrol Tab */}
        <TabsContent value="patrol" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Patrol Checkpoints</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Checkpoint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Patrol Checkpoint</DialogTitle>
                  <DialogDescription>
                    Create a new GPS checkpoint for patrol monitoring
                  </DialogDescription>
                </DialogHeader>
                <AddLocationForm
                  type="patrol"
                  onClose={() => setIsAddDialogOpen(false)}
                  newLocationData={newLocationData}
                  setNewLocationData={setNewLocationData}
                />
              </DialogContent>
            </Dialog>
          </div>

          {filteredSites.length === 0 ? (
            <Card className="border-border">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No sites available</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredSites.map((site) => {
                const checkpoints = getPatrolCheckpoints(site.id)
                return (
                  <Card key={site.id} className="border-border">
                    <AccordionItem value={site.id} className="border-0">
                      <CardHeader className="pb-3">
                        <AccordionTrigger className="hover:no-underline -mx-6 px-6 py-0">
                          <div className="flex items-center gap-3 flex-1 text-left">
                            <MapPin className="h-4 w-4 text-chart-2 shrink-0" />
                            <div>
                              <p className="font-semibold">{site.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {checkpoints.length} checkpoint{checkpoints.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent className="pt-0">
                        <CardContent className="space-y-4">
                          {checkpoints.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No patrol checkpoints configured for this site</p>
                          ) : (
                            <div className="rounded-lg border border-border overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>Checkpoint</TableHead>
                                    <TableHead>Radius</TableHead>
                                    <TableHead>Coordinates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-24 text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {checkpoints.map((location) => (
                                    <TableRow key={location.id}>
                                      <TableCell className="font-medium">{location.name}</TableCell>
                                      <TableCell>{location.radius.toFixed(0)}m</TableCell>
                                      <TableCell className="text-xs font-mono text-muted-foreground">
                                        {location.latitude}, {location.longitude}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={location.status === 'Active' ? 'default' : 'secondary'}>
                                          {location.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                )
              })}
            </Accordion>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AddLocationFormProps {
  type: 'attendance' | 'patrol'
  onClose: () => void
  newLocationData: any
  setNewLocationData: (data: any) => void
}

function AddLocationForm({
  type,
  onClose,
  newLocationData,
  setNewLocationData,
}: AddLocationFormProps) {
  const handleAddLocation = () => {
    if (!newLocationData.name || !newLocationData.latitude || !newLocationData.longitude) {
      alert('Please fill in all required fields')
      return
    }
    
    console.log(`[v0] Adding ${type} location:`, newLocationData)
    
    // Reset form and close dialog
    setNewLocationData({
      name: '',
      siteId: 'site-1',
      latitude: '',
      longitude: '',
      radius: '50',
    })
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site" className="text-sm font-medium">
          Site <span className="text-destructive">*</span>
        </Label>
        <Select value={newLocationData.siteId} onValueChange={(value) => setNewLocationData({ ...newLocationData, siteId: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockSites
              .filter((s) => s.id !== 'all')
              .map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          {type === 'attendance' ? 'Location Name' : 'Checkpoint Name'} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder={type === 'attendance' ? 'e.g., Main Entrance' : 'e.g., Checkpoint A1'}
          value={newLocationData.name}
          onChange={(e) => setNewLocationData({ ...newLocationData, name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude" className="text-sm font-medium">
            Latitude <span className="text-destructive">*</span>
          </Label>
          <Input
            id="latitude"
            placeholder="-6.2088"
            value={newLocationData.latitude}
            onChange={(e) => setNewLocationData({ ...newLocationData, latitude: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude" className="text-sm font-medium">
            Longitude <span className="text-destructive">*</span>
          </Label>
          <Input
            id="longitude"
            placeholder="106.8456"
            value={newLocationData.longitude}
            onChange={(e) => setNewLocationData({ ...newLocationData, longitude: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="radius" className="text-sm font-medium">
          Radius (meters)
        </Label>
        <Input
          id="radius"
          type="number"
          placeholder="50"
          value={newLocationData.radius}
          onChange={(e) => setNewLocationData({ ...newLocationData, radius: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAddLocation} className="gap-1">
          <Plus className="h-4 w-4" />
          Add {type === 'attendance' ? 'Location' : 'Checkpoint'}
        </Button>
      </div>
    </div>
  )
}
