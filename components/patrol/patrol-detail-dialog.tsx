'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import useSWR from 'swr'
import { MapPin, Clock, User, FileText } from 'lucide-react'

interface PatrolLocation {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'missed'
  lastCheck?: string
  officer?: string
}

interface PatrolDetailDialogProps {
  location: PatrolLocation
  siteId: string
  onClose: () => void
}

export function PatrolDetailDialog({ location, siteId, onClose }: PatrolDetailDialogProps) {
  const { data: patrols, isLoading } = useSWR<PatrolRecord[]>(
    siteId ? `/api/patrol/records?siteId=${encodeURIComponent(siteId)}` : null,
    async (url) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load patrol details')
      return response.json()
    },
    { revalidateOnFocus: false }
  )
  const patrolData = patrols?.find((patrol) => patrol.checkpoint === location.name)
  const completedAt = patrolData?.timestamp
    ? new Date(patrolData.timestamp).toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      })
    : null

  return (
    <Dialog open={!!location} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{location.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Status</span>
                <Badge className={location.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                  {location.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Completed At</p>
                  <p className="text-sm font-medium">{isLoading ? 'Loading...' : completedAt || 'No patrol recorded'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Officer</p>
                  <p className="text-sm font-medium">{location.officer || 'Not assigned'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm font-medium mt-1">{patrolData?.description || 'No notes recorded.'}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              {patrolData?.photos ? `${patrolData.photos} evidence photo(s) recorded.` : 'No evidence photos recorded.'}
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">GPS Location</p>
                  <p className="text-sm font-medium">
                    {patrolData?.gpsStatus === 'verified' ? 'GPS verified' : 'GPS not verified'}
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 text-center h-40 flex items-center justify-center text-muted-foreground">
                Map View (Integration Required)
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
