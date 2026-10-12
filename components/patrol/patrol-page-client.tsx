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
import { MapPin, AlertCircle } from 'lucide-react'

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
  clientName?: string
}

interface PatrolPageClientProps {
  clients: Client[]
  sitesByClient: Record<string, Site[]>
}

export function PatrolPageClient({ clients, sitesByClient }: PatrolPageClientProps) {
  // Flatten all sites from all clients
  const allSites: Site[] = []
  clients.forEach((client) => {
    const sites = sitesByClient[client.id] || []
    sites.forEach((site) => {
      allSites.push({
        ...site,
        clientName: client.name,
      })
    })
  })

  const [selectedSite, setSelectedSite] = useState<string | undefined>(() => allSites[0]?.id)
  const [viewMode, setViewMode] = useState<'status' | 'timeline'>('status')
  const currentSite = allSites.find((s) => s.id === selectedSite)

  // Show empty state if no sites available
  if (allSites.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-border rounded-lg">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No sites available. Please set up sites first.</p>
      </div>
    )
  }

  return (
    <>
      {/* Site Header and Selector */}
      {currentSite && (
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{currentSite.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Code: <span className="font-semibold">{currentSite.code}</span> •
              Checkpoints: <span className="font-semibold">{currentSite.checkpointCount}</span>
              {currentSite.clientName && (
                <>
                  {' '}
                  • Company: <span className="font-semibold">{currentSite.clientName}</span>
                </>
              )}
            </p>
          </div>

          <div className="w-full sm:w-72 sm:shrink-0">
            <label htmlFor="patrol-site-selector" className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4" />
              Site
            </label>
            <Select value={selectedSite || ''} onValueChange={setSelectedSite}>
              <SelectTrigger id="patrol-site-selector" aria-label="Change patrol site">
                <SelectValue placeholder="Choose a site" />
              </SelectTrigger>
              <SelectContent>
                {allSites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name} ({site.code})
                    {site.clientName && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        • {site.clientName}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
