'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'

interface CheckpointStatus {
  id: string
  name: string
  lastPatrol?: {
    officer: string
    time: string
    gpsVerified: boolean
    photosCount: number
    notes?: string
  }
  status: 'completed' | 'pending' | 'overdue'
}

export function CheckpointStatusDashboard({ siteId }: { siteId: string }) {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointStatus | null>(null)

  // Mock data - in real implementation, fetch from database
  const mockCheckpoints: CheckpointStatus[] = [
    {
      id: '1',
      name: 'Gate Entrance',
      lastPatrol: {
        officer: 'John Doe',
        time: '09:30 AM',
        gpsVerified: true,
        photosCount: 2,
        notes: 'Gate entrance secure. All locks functioning properly. No suspicious activity detected.',
      },
      status: 'completed',
    },
    {
      id: '2',
      name: 'Perimeter North',
      lastPatrol: {
        officer: 'Jane Smith',
        time: '09:15 AM',
        gpsVerified: true,
        photosCount: 1,
        notes: 'North perimeter fence intact. No damage or breaches observed. Completed full circuit inspection.',
      },
      status: 'completed',
    },
    {
      id: '3',
      name: 'Perimeter South',
      status: 'pending',
    },
    {
      id: '4',
      name: 'Back Gate',
      lastPatrol: {
        officer: 'Bob Johnson',
        time: '09:00 AM',
        gpsVerified: true,
        photosCount: 3,
        notes: 'Back gate secured and locked. Hinges checked and functioning normally. Area around gate cleared.',
      },
      status: 'completed',
    },
    {
      id: '5',
      name: 'Parking Area',
      lastPatrol: {
        officer: 'Charlie Davis',
        time: '08:15 AM',
        gpsVerified: false,
        photosCount: 1,
        notes: 'Parking area patrol completed. 5 vehicles present, all parked in designated zones. No security concerns.',
      },
      status: 'overdue',
    },
    {
      id: '6',
      name: 'Loading Dock',
      status: 'pending',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 border-success/30 hover:bg-success/15'
      case 'overdue':
        return 'bg-destructive/10 border-destructive/30 hover:bg-destructive/15'
      default:
        return 'bg-muted/50 border-muted hover:bg-muted'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success">Completed</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {mockCheckpoints.map((checkpoint) => (
          <Card
            key={checkpoint.id}
            className={`border p-3 cursor-pointer transition-all ${getStatusColor(
              checkpoint.status
            )}`}
            onClick={() => setSelectedCheckpoint(checkpoint)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-card-foreground line-clamp-2">
                    {checkpoint.name}
                  </h3>
                </div>
              </div>
              {getStatusIcon(checkpoint.status)}
            </div>

            {checkpoint.lastPatrol ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{checkpoint.lastPatrol.officer}</span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>{checkpoint.lastPatrol.time}</span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs py-0 px-1.5 ${
                      checkpoint.lastPatrol.gpsVerified
                        ? 'border-success/50 text-success'
                        : 'border-warning/50 text-warning'
                    }`}
                  >
                    {checkpoint.lastPatrol.gpsVerified ? '✓ GPS' : '⚠ GPS'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs py-0 px-1.5">
                    {checkpoint.lastPatrol.photosCount} photo{checkpoint.lastPatrol.photosCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No patrol recorded</p>
            )}

            <div className="mt-2 pt-2 border-t border-border flex justify-end">
              {getStatusBadge(checkpoint.status)}
            </div>
          </Card>
        ))}
      </div>

      {/* Checkpoint Detail Modal */}
      <Dialog open={!!selectedCheckpoint} onOpenChange={() => setSelectedCheckpoint(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCheckpoint?.name}</DialogTitle>
          </DialogHeader>
          {selectedCheckpoint && (
            <div className="space-y-4">
              {selectedCheckpoint.lastPatrol ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Officer</p>
                      <p className="font-semibold">{selectedCheckpoint.lastPatrol.officer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Patrol Time
                      </p>
                      <p className="font-semibold">{selectedCheckpoint.lastPatrol.time}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        GPS Status
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            selectedCheckpoint.lastPatrol.gpsVerified
                              ? 'bg-success'
                              : 'bg-warning'
                          }
                        >
                          {selectedCheckpoint.lastPatrol.gpsVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Evidence Photos
                      </p>
                      <p className="font-semibold">
                        {selectedCheckpoint.lastPatrol.photosCount} photos
                      </p>
                    </div>
                  </div>

                  {/* Sample evidence images */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Evidence</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: selectedCheckpoint.lastPatrol.photosCount }).map(
                        (_, idx) => (
                          <img
                            key={idx}
                            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop"
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )
                      )}
                    </div>
                  </div>

                  {/* Patrol Report Notes */}
                  {selectedCheckpoint.lastPatrol.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Patrol Report</p>
                      <div className="bg-muted/50 border border-border rounded-lg p-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {selectedCheckpoint.lastPatrol.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No patrol data available for this checkpoint.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
