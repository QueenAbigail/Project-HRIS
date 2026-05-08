'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function GPSLocationsPage() {
  const [attendanceLocations] = useState([
    { id: 1, name: 'Head Office', latitude: '-6.2088', longitude: '106.8456', radius: 100, status: 'Active' },
    { id: 2, name: 'Building A', latitude: '-6.2095', longitude: '106.8460', radius: 80, status: 'Active' },
  ])

  const [patrolLocations] = useState([
    { id: 1, name: 'Main Gate', latitude: '-6.2080', longitude: '106.8450', radius: 50, status: 'Active' },
    { id: 2, name: 'Parking Area', latitude: '-6.2100', longitude: '106.8465', radius: 75, status: 'Active' },
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GPS Locations</h1>
        <p className="text-muted-foreground mt-1">Manage GPS location checkpoints for attendance and patrol monitoring</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance GPS Locations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Attendance Locations</CardTitle>
                  <CardDescription>GPS checkpoints for attendance tracking</CardDescription>
                </div>
              </div>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {attendanceLocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No attendance locations yet. Click "Add" to get started.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Location</TableHead>
                      <TableHead>Radius</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.radius}m</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {location.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patrol GPS Locations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-chart-2" />
                <div>
                  <CardTitle>Patrol Locations</CardTitle>
                  <CardDescription>GPS checkpoints for patrol monitoring</CardDescription>
                </div>
              </div>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patrolLocations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No patrol locations yet. Click "Add" to get started.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Location</TableHead>
                      <TableHead>Radius</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patrolLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell className="font-medium">{location.name}</TableCell>
                        <TableCell>{location.radius}m</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {location.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
