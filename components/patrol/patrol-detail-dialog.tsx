'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Camera, MapPin, Clock, User, FileText } from 'lucide-react'

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
  // Mock patrol data
  const patrolData = {
    completedAt: '08:30 AM',
    gpsLocation: { lat: 6.2088, lng: 106.8456 },
    description: 'All areas secured, no issues detected',
    photos: [
      { id: 1, url: '/api/placeholder/400/300', caption: 'Gate entrance area' },
      { id: 2, url: '/api/placeholder/400/300', caption: 'Perimeter check' },
    ],
  }

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
                  <p className="text-sm font-medium">{patrolData.completedAt}</p>
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
                  <p className="text-sm font-medium mt-1">{patrolData.description}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {patrolData.photos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{photo.caption}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">GPS Location</p>
                  <p className="text-sm font-mono font-medium">
                    {patrolData.gpsLocation.lat}, {patrolData.gpsLocation.lng}
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
