'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { CheckCircle2, Clock, AlertCircle, Camera, MapPin, User, Info } from 'lucide-react'
import { PatrolDetailDialog } from './patrol-detail-dialog'

interface PatrolLocation {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'missed'
  lastCheck?: string
  officer?: string
}

interface PatrolLocationCardsProps {
  locations: PatrolLocation[]
  siteId: string
}

export function PatrolLocationCards({ locations, siteId }: PatrolLocationCardsProps) {
  const [selectedLocation, setSelectedLocation] = useState<PatrolLocation | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-warning" />
      case 'missed':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 border-success/30'
      case 'in_progress':
        return 'bg-warning/10 border-warning/30'
      case 'missed':
        return 'bg-destructive/10 border-destructive/30'
      default:
        return 'bg-background'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>
      default:
        return null
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {locations.map((location) => (
          <Card
            key={location.id}
            className={`p-4 border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(location.status)}`}
            onClick={() => setSelectedLocation(location)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{getStatusIcon(location.status)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground">{location.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Click for details</p>
                </div>
              </div>
              {getStatusBadge(location.status)}
            </div>

            <div className="space-y-2 text-sm">
              {location.lastCheck && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{location.lastCheck}</span>
                </div>
              )}
              {location.officer && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{location.officer}</span>
                </div>
              )}
              {location.status === 'missed' && (
                <div className="flex items-center gap-2 text-destructive mt-3">
                  <AlertCircle className="h-3 w-3" />
                  <span className="font-medium">No patrol recorded</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedLocation && (
        <PatrolDetailDialog location={selectedLocation} siteId={siteId} onClose={() => setSelectedLocation(null)} />
      )}
    </>
  )
}
