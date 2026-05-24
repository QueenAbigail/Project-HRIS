'use client'

import { useState } from 'react'
import { PatrolHeader } from '@/components/patrol/patrol-header'
import { CheckpointStatusDashboard } from '@/components/patrol/checkpoint-status-dashboard'
import { PatrolTimelineView } from '@/components/patrol/patrol-timeline-view'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin } from 'lucide-react'

interface Client {
  id: string
  name: string
  totalSites: number
}

interface Site {
  id: string
  clientId: string
  name: string
  code: string
  checkpointCount: number
}

// Mock data - will be replaced with database queries
const mockClients: Client[] = [
  { id: 'client-1', name: 'Acme Corporation', totalSites: 3 },
  { id: 'client-2', name: 'Tech Solutions Inc', totalSites: 5 },
  { id: 'client-3', name: 'Global Services Ltd', totalSites: 2 },
  { id: 'client-4', name: 'Security First Agency', totalSites: 4 },
]

const mockSitesByClient: Record<string, Site[]> = {
  'client-1': [
    { id: 's1-1', clientId: 'client-1', name: 'Main Gate', code: 'MGS', checkpointCount: 17 },
    { id: 's1-2', clientId: 'client-1', name: 'Building A', code: 'BA', checkpointCount: 17 },
    { id: 's1-3', clientId: 'client-1', name: 'Building B', code: 'BB', checkpointCount: 17 },
  ],
  'client-2': [
    { id: 's2-1', clientId: 'client-2', name: 'Head Office', code: 'HO', checkpointCount: 17 },
    { id: 's2-2', clientId: 'client-2', name: 'Warehouse', code: 'WH', checkpointCount: 17 },
    { id: 's2-3', clientId: 'client-2', name: 'Distribution Center', code: 'DC', checkpointCount: 17 },
    { id: 's2-4', clientId: 'client-2', name: 'Admin Building', code: 'AD', checkpointCount: 17 },
    { id: 's2-5', clientId: 'client-2', name: 'Parking Area', code: 'PA', checkpointCount: 17 },
  ],
  'client-3': [
    { id: 's3-1', clientId: 'client-3', name: 'North Site', code: 'NS', checkpointCount: 17 },
    { id: 's3-2', clientId: 'client-3', name: 'South Site', code: 'SS', checkpointCount: 17 },
  ],
  'client-4': [
    { id: 's4-1', clientId: 'client-4', name: 'Checkpoint A', code: 'CPA', checkpointCount: 17 },
    { id: 's4-2', clientId: 'client-4', name: 'Checkpoint B', code: 'CPB', checkpointCount: 17 },
    { id: 's4-3', clientId: 'client-4', name: 'Checkpoint C', code: 'CPC', checkpointCount: 17 },
    { id: 's4-4', clientId: 'client-4', name: 'Checkpoint D', code: 'CPD', checkpointCount: 17 },
  ],
}

export default function PatrolPage() {
  const [selectedClient, setSelectedClient] = useState(mockClients[0].id)
  const [selectedSite, setSelectedSite] = useState<string>()
  const [viewMode, setViewMode] = useState<'status' | 'timeline'>('status')

  const clientSites = mockSitesByClient[selectedClient] || []
  
  // Set first site when client changes
  if (!selectedSite && clientSites.length > 0) {
    setSelectedSite(clientSites[0].id)
  }

  const currentClient = mockClients.find((c) => c.id === selectedClient)
  const currentSite = clientSites.find((s) => s.id === selectedSite)

  return (
    <div className="space-y-6">
      <PatrolHeader />

      {/* Site Selector */}
      <div className="flex items-end gap-4">
        <div className="flex-1 max-w-xs">
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Select Site
          </label>
          <Select value={selectedSite || ''} onValueChange={setSelectedSite}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a site" />
            </SelectTrigger>
            <SelectContent>
              {clientSites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name} ({site.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Site Header */}
      {currentSite && (
        <div className="flex items-start justify-between gap-4 p-4 bg-card border border-border rounded-lg">
          <div>
            <h2 className="text-2xl font-bold">{currentSite.name}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Code: <span className="font-semibold">{currentSite.code}</span> • 
              Checkpoints: <span className="font-semibold">{currentSite.checkpointCount}</span>
            </p>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      {currentSite && (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'status' | 'timeline')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Checkpoint Status</TabsTrigger>
            <TabsTrigger value="timeline">Patrol Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-6">
            <CheckpointStatusDashboard siteId={currentSite.id} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <PatrolTimelineView siteId={currentSite.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

