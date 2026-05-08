'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PatrolLocationCards } from './patrol-location-cards'
import { MissingPatrolsList } from './missing-patrols-list'

interface Site {
  id: string
  name: string
  code: string
}

interface PatrolLocation {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'missed'
  lastCheck?: string
  officer?: string
}

// Mock data - in real implementation, fetch from database
const mockSites: Site[] = [
  { id: '1', name: 'Main Gate Site', code: 'MGS' },
  { id: '2', name: 'Building A Site', code: 'BAS' },
  { id: '3', name: 'Building B Site', code: 'BBS' },
]

const mockLocations: Record<string, PatrolLocation[]> = {
  '1': [
    { id: 'loc1', name: 'Gate Entrance', status: 'completed', lastCheck: '08:30 AM', officer: 'John Doe' },
    { id: 'loc2', name: 'Perimeter North', status: 'in_progress', officer: 'Jane Smith' },
    { id: 'loc3', name: 'Perimeter South', status: 'missed' },
    { id: 'loc4', name: 'Back Gate', status: 'completed', lastCheck: '09:15 AM', officer: 'Bob Johnson' },
  ],
  '2': [
    { id: 'loc5', name: 'Building Entrance', status: 'completed', lastCheck: '08:45 AM', officer: 'Alice Brown' },
    { id: 'loc6', name: 'Parking Area', status: 'missed' },
    { id: 'loc7', name: 'Ground Floor', status: 'in_progress', officer: 'Charlie Davis' },
  ],
  '3': [
    { id: 'loc8', name: 'Main Door', status: 'completed', lastCheck: '09:00 AM', officer: 'Eve Wilson' },
    { id: 'loc9', name: 'Loading Dock', status: 'missed' },
  ],
}

export function PatrolBySiteView() {
  const [selectedSite, setSelectedSite] = useState(mockSites[0].id)

  const currentSite = mockSites.find((s) => s.id === selectedSite)
  const locations = mockLocations[selectedSite] || []

  return (
    <div className="space-y-6">
      <Tabs value={selectedSite} onValueChange={setSelectedSite}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${mockSites.length}, minmax(0, 1fr))` }}>
          {mockSites.map((site) => (
            <TabsTrigger key={site.id} value={site.id} className="text-sm">
              <span>{site.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {mockSites.map((site) => (
          <TabsContent key={site.id} value={site.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{site.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">Code: {site.code}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {locations.filter((l) => l.status === 'completed').length} Completed
                </Badge>
                <Badge variant="secondary">
                  {locations.filter((l) => l.status === 'in_progress').length} In Progress
                </Badge>
                <Badge variant="destructive">
                  {locations.filter((l) => l.status === 'missed').length} Missed
                </Badge>
              </div>
            </div>

            <PatrolLocationCards locations={locations} siteId={site.id} />
            <MissingPatrolsList siteId={site.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
