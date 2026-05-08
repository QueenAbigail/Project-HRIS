'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react'

// Mock data - replace with database queries
const mockAttendanceData = {
  sites: [
    {
      id: 'site-1',
      name: 'Main Gate Site',
      code: 'MG-01',
      locations: [
        { id: 1, name: 'Main Entrance', latitude: '-6.2088', longitude: '106.8456', radius: 50, status: 'Active' },
        { id: 2, name: 'Back Entrance', latitude: '-6.2095', longitude: '106.8460', radius: 45, status: 'Active' },
        { id: 3, name: 'Security Booth', latitude: '-6.2100', longitude: '106.8465', radius: 30, status: 'Active' },
      ],
    },
    {
      id: 'site-2',
      name: 'Building A',
      code: 'BA-01',
      locations: [
        { id: 4, name: 'Building A Lobby', latitude: '-6.2110', longitude: '106.8470', radius: 60, status: 'Active' },
        { id: 5, name: 'Floor 1 Reception', latitude: '-6.2115', longitude: '106.8475', radius: 40, status: 'Active' },
      ],
    },
  ],
}

const mockPatrolData = {
  sites: [
    {
      id: 'site-1',
      name: 'Main Gate Site',
      code: 'MG-01',
      locations: Array.from({ length: 17 }, (_, i) => ({
        id: i + 1,
        name: `Checkpoint ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
        latitude: String(-6.2088 + (Math.random() * 0.01)).substring(0, 8),
        longitude: String(106.8456 + (Math.random() * 0.01)).substring(0, 9),
        radius: 30 + Math.random() * 20,
        status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      })),
    },
    {
      id: 'site-2',
      name: 'Building A',
      code: 'BA-01',
      locations: Array.from({ length: 12 }, (_, i) => ({
        id: i + 18,
        name: `Building A Check ${i + 1}`,
        latitude: String(-6.2110 + (Math.random() * 0.01)).substring(0, 8),
        longitude: String(106.8470 + (Math.random() * 0.01)).substring(0, 9),
        radius: 25 + Math.random() * 15,
        status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      })),
    },
  ],
}

export default function GPSLocationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GPS Locations</h1>
        <p className="text-muted-foreground mt-2">
          Manage GPS location checkpoints grouped by site for attendance and patrol monitoring
        </p>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
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
            <h2 className="text-xl font-semibold">Attendance GPS Locations by Site</h2>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {mockAttendanceData.sites.map((site) => (
              <Card key={site.id} className="border-border">
                <AccordionItem value={site.id} className="border-0">
                  <CardHeader className="pb-3">
                    <AccordionTrigger className="hover:no-underline -mx-6 px-6 py-0">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-semibold">{site.name}</p>
                          <p className="text-xs text-muted-foreground">{site.locations.length} locations</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  <AccordionContent className="pt-0">
                    <CardContent className="space-y-4">
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
                            {site.locations.map((location) => (
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
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        </TabsContent>

        {/* Patrol Tab */}
        <TabsContent value="patrol" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Patrol Checkpoints by Site</h2>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Checkpoint
            </Button>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {mockPatrolData.sites.map((site) => (
              <Card key={site.id} className="border-border">
                <AccordionItem value={site.id} className="border-0">
                  <CardHeader className="pb-3">
                    <AccordionTrigger className="hover:no-underline -mx-6 px-6 py-0">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <MapPin className="h-4 w-4 text-chart-2 shrink-0" />
                        <div>
                          <p className="font-semibold">{site.name}</p>
                          <p className="text-xs text-muted-foreground">{site.locations.length} checkpoints</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  <AccordionContent className="pt-0">
                    <CardContent className="space-y-4">
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
                            {site.locations.map((location) => (
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
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  )
}
