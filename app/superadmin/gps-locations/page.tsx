'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Edit, Trash2, Building2, Search, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
}

interface Site {
  id: string
  name: string
  code: string
}

export default function GPSLocationsPage() {
  const { toast } = useToast()
  const [sites, setSites] = useState<Site[]>([])
  const [attendanceLocations, setAttendanceLocations] = useState<Record<string, Location[]>>({})
  const [patrolLocations, setPatrolLocations] = useState<Record<string, Location[]>>({})
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('attendance')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedSiteId, setSelectedSiteId] = useState('')
  
  const [newLocation, setNewLocation] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '50',
  })
  
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)

  // Fetch sites on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/companies')
        if (!response.ok) throw new Error('Failed to fetch companies')
        const companies = await response.json()
        
        // Get all sites from all companies
        const allSites: Site[] = []
        for (const company of companies) {
          if (company.sites) {
            allSites.push(...company.sites)
          }
        }
        setSites(allSites)
        
        // Fetch locations for each site
        const attendanceData: Record<string, Location[]> = {}
        const patrolData: Record<string, Location[]> = {}
        
        for (const site of allSites) {
          const [attResp, patrolResp] = await Promise.all([
            fetch(`/api/sites/${site.id}/attendance-locations`),
            fetch(`/api/sites/${site.id}/patrol-locations`),
          ])
          
          if (attResp.ok) {
            attendanceData[site.id] = await attResp.json()
          }
          if (patrolResp.ok) {
            patrolData[site.id] = await patrolResp.json()
          }
        }
        
        setAttendanceLocations(attendanceData)
        setPatrolLocations(patrolData)
      } catch (error) {
        console.error('[v0] Error fetching GPS data:', error)
        toast({ title: 'Error', description: 'Failed to load GPS locations', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddLocation = async (type: 'attendance' | 'patrol') => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude || !selectedSiteId) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const endpoint = `/api/sites/${selectedSiteId}/${type}-locations`
      const response = await fetch(endpoint, {
        method: editingLocation ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingLocation
            ? { locationId: editingLocation.id, ...newLocation, radius: parseInt(newLocation.radius) }
            : { ...newLocation, radius: parseInt(newLocation.radius) }
        ),
      })

      if (!response.ok) throw new Error('Failed to save location')
      const savedLocation = await response.json()

      if (type === 'attendance') {
        setAttendanceLocations(prev => ({
          ...prev,
          [selectedSiteId]: editingLocation
            ? prev[selectedSiteId].map(l => l.id === editingLocation.id ? savedLocation : l)
            : [...(prev[selectedSiteId] || []), savedLocation],
        }))
      } else {
        setPatrolLocations(prev => ({
          ...prev,
          [selectedSiteId]: editingLocation
            ? prev[selectedSiteId].map(l => l.id === editingLocation.id ? savedLocation : l)
            : [...(prev[selectedSiteId] || []), savedLocation],
        }))
      }

      toast({ title: 'Success', description: 'Location saved successfully' })
      setIsAddDialogOpen(false)
      setNewLocation({ name: '', latitude: '', longitude: '', radius: '50' })
      setEditingLocation(null)
      setSelectedSiteId('')
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save location', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteLocation = async (siteId: string, locationId: string, type: 'attendance' | 'patrol') => {
    try {
      const response = await fetch(`/api/sites/${siteId}/${type}-locations?locationId=${locationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete location')

      if (type === 'attendance') {
        setAttendanceLocations(prev => ({
          ...prev,
          [siteId]: prev[siteId].filter(l => l.id !== locationId),
        }))
      } else {
        setPatrolLocations(prev => ({
          ...prev,
          [siteId]: prev[siteId].filter(l => l.id !== locationId),
        }))
      }

      toast({ title: 'Success', description: 'Location deleted successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete location', variant: 'destructive' })
    }
  }

  const openAddDialog = (siteId: string) => {
    setSelectedSiteId(siteId)
    setEditingLocation(null)
    setNewLocation({ name: '', latitude: '', longitude: '', radius: '50' })
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (siteId: string, location: Location) => {
    setSelectedSiteId(siteId)
    setEditingLocation(location)
    setNewLocation({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius.toString(),
    })
    setIsAddDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsAddDialogOpen(false)
    setEditingLocation(null)
    setNewLocation({ name: '', latitude: '', longitude: '', radius: '50' })
    setSelectedSiteId('')
  }

  if (isLoading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GPS Locations</h1>
        <p className="text-muted-foreground mt-2">
          Manage GPS location checkpoints grouped by site for attendance and patrol monitoring
        </p>
      </div>

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
      </div>

      <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="w-full">
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

        <TabsContent value="attendance" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Attendance GPS Locations</h2>

          {filteredSites.length === 0 ? (
            <Card className="border-border">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No sites available</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredSites.map((site) => {
                const locations = attendanceLocations[site.id] || []
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
                          <Button size="sm" className="gap-1" onClick={() => openAddDialog(site.id)}>
                            <Plus className="h-4 w-4" />
                            Add Location
                          </Button>
                          <Dialog open={isAddDialogOpen && selectedSiteId === site.id} onOpenChange={handleDialogClose}>
                              <DialogHeader>
                                <DialogTitle>{editingLocation ? 'Edit' : 'Add'} Attendance Location</DialogTitle>
                                <DialogDescription>
                                  {editingLocation ? 'Update the' : 'Create a new'} GPS location for attendance tracking
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name">Location Name</Label>
                                  <Input
                                    id="name"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Main Entrance"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                      id="latitude"
                                      value={newLocation.latitude}
                                      onChange={(e) => setNewLocation(prev => ({ ...prev, latitude: e.target.value }))}
                                      placeholder="-6.2088"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                      id="longitude"
                                      value={newLocation.longitude}
                                      onChange={(e) => setNewLocation(prev => ({ ...prev, longitude: e.target.value }))}
                                      placeholder="106.8456"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="radius">Radius (meters)</Label>
                                  <Input
                                    id="radius"
                                    type="number"
                                    value={newLocation.radius}
                                    onChange={(e) => setNewLocation(prev => ({ ...prev, radius: e.target.value }))}
                                    placeholder="50"
                                  />
                                </div>
                                <Button onClick={() => handleAddLocation('attendance')} className="w-full" disabled={isSaving}>
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>{editingLocation ? 'Update' : 'Add'} Location</>
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {locations.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No attendance locations for this site</p>
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
                                      <TableCell>{location.radius}m</TableCell>
                                      <TableCell className="text-xs font-mono text-muted-foreground">
                                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={location.isActive ? 'default' : 'secondary'}>
                                          {location.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(site.id, location)}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteLocation(site.id, location.id, 'attendance')}>
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

        <TabsContent value="patrol" className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold">Patrol Checkpoints</h2>

          {filteredSites.length === 0 ? (
            <Card className="border-border">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No sites available</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredSites.map((site) => {
                const locations = patrolLocations[site.id] || []
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
                                {locations.length} checkpoint{locations.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      <AccordionContent className="pt-0">
                        <CardContent className="space-y-4">
                          <Button size="sm" className="gap-1" onClick={() => openAddDialog(site.id)}>
                            <Plus className="h-4 w-4" />
                            Add Checkpoint
                          </Button>
                          <Dialog open={isAddDialogOpen && selectedSiteId === site.id} onOpenChange={handleDialogClose}>
                              <DialogHeader>
                                <DialogTitle>{editingLocation ? 'Edit' : 'Add'} Patrol Checkpoint</DialogTitle>
                                <DialogDescription>
                                  {editingLocation ? 'Update the' : 'Create a new'} GPS checkpoint for patrol monitoring
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name">Checkpoint Name</Label>
                                  <Input
                                    id="name"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Gate A"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                      id="latitude"
                                      value={newLocation.latitude}
                                      onChange={(e) => setNewLocation(prev => ({ ...prev, latitude: e.target.value }))}
                                      placeholder="-6.2088"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                      id="longitude"
                                      value={newLocation.longitude}
                                      onChange={(e) => setNewLocation(prev => ({ ...prev, longitude: e.target.value }))}
                                      placeholder="106.8456"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="radius">Radius (meters)</Label>
                                  <Input
                                    id="radius"
                                    type="number"
                                    value={newLocation.radius}
                                    onChange={(e) => setNewLocation(prev => ({ ...prev, radius: e.target.value }))}
                                    placeholder="50"
                                  />
                                </div>
                                <Button onClick={() => handleAddLocation('patrol')} className="w-full" disabled={isSaving}>
                                  {isSaving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>{editingLocation ? 'Update' : 'Add'} Checkpoint</>
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {locations.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No patrol checkpoints for this site</p>
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
                                  {locations.map((location) => (
                                    <TableRow key={location.id}>
                                      <TableCell className="font-medium">{location.name}</TableCell>
                                      <TableCell>{location.radius}m</TableCell>
                                      <TableCell className="text-xs font-mono text-muted-foreground">
                                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={location.isActive ? 'default' : 'secondary'}>
                                          {location.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(site.id, location)}>
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteLocation(site.id, location.id, 'patrol')}>
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
