'use client'

import { useState } from 'react'
import { PatrolHeader } from '@/components/patrol/patrol-header'
import { PatrolStats } from '@/components/patrol/patrol-stats'
import { CheckpointStatusDashboard } from '@/components/patrol/checkpoint-status-dashboard'
import { PatrolTimelineView } from '@/components/patrol/patrol-timeline-view'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface Site {
  id: string
  name: string
  code: string
}

// Mock sites data
const mockSites: Site[] = [
  { id: '1', name: 'Main Gate Site', code: 'MGS' },
  { id: '2', name: 'Building A Site', code: 'BAS' },
  { id: '3', name: 'Building B Site', code: 'BBS' },
]

export default function PatrolPage() {
  const [selectedSite, setSelectedSite] = useState(mockSites[0].id)
  const [viewMode, setViewMode] = useState<'status' | 'timeline'>('status')

  const currentSite = mockSites.find((s) => s.id === selectedSite)

  return (
    <div className="space-y-6">
      <PatrolHeader />
      <PatrolStats />

      {/* Site Selection Tabs */}
      <div>
        <Tabs value={selectedSite} onValueChange={setSelectedSite}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${mockSites.length}, minmax(0, 1fr))` }}>
            {mockSites.map((site) => (
              <TabsTrigger key={site.id} value={site.id} className="text-sm">
                {site.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Site Header */}
      {currentSite && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{currentSite.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Code: {currentSite.code}</p>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'status' | 'timeline')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">Checkpoint Status</TabsTrigger>
          <TabsTrigger value="timeline">Patrol Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-6">
          <CheckpointStatusDashboard siteId={selectedSite} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <PatrolTimelineView siteId={selectedSite} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

