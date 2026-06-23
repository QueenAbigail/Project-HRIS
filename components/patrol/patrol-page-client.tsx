'use client'

import { useState } from 'react'
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

interface PatrolPageClientProps {
  clients: Client[]
  sitesByClient: Record<string, Site[]>
}

export function PatrolPageClient({ clients, sitesByClient }: PatrolPageClientProps) {
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '')
  const [selectedSite, setSelectedSite] = useState<string>()
  const [viewMode, setViewMode] = useState<'status' | 'timeline'>('status')

  const clientSites = sitesByClient[selectedClient] || []

  // Set first site when client changes
  const firstSite = clientSites[0]?.id
  if (!selectedSite && firstSite) {
    setSelectedSite(firstSite)
  }

  const currentClient = clients.find((c) => c.id === selectedClient)
  const currentSite = clientSites.find((s) => s.id === selectedSite)

  return (
    <>
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
    </>
  )
}
