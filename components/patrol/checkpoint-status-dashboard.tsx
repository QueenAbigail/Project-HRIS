'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

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
  const fetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to load checkpoint data')
    return response.json()
  }
  const { data: locations, error: locationsError, isLoading: locationsLoading } = useSWR<Array<{ id: string; name: string }>>(
    siteId ? `/api/patrol/locations?siteId=${encodeURIComponent(siteId)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: records, error: recordsError, isLoading: recordsLoading } = useSWR<Array<{
    id: string
    locationId: string
    officer: string
    timestamp: string
    gpsVerified: boolean
    photos: number
    notes: string | null
  }>>(
    siteId && locations?.length
      ? `/api/patrol/records?siteId=${encodeURIComponent(siteId)}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const error = locationsError || recordsError
  const isLoading = locationsLoading || recordsLoading

  useEffect(() => {
    if (error) {
      toast.error('Checkpoint status could not be loaded', {
        description: 'Please check your connection or contact an administrator if the problem continues.',
      })
    }
  }, [error])

  const checkpoints: CheckpointStatus[] = (locations ?? []).map((location) => {
    const lastPatrol = records?.find((record) => record.locationId === location.id)
    return {
      id: location.id,
      name: location.name,
      status: lastPatrol ? 'completed' : 'pending',
      lastPatrol: lastPatrol
        ? {
            officer: lastPatrol.officer,
            time: new Date(lastPatrol.timestamp).toLocaleTimeString('en-GB', {
              timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
            }),
            gpsVerified: lastPatrol.gpsVerified,
            photosCount: lastPatrol.photos,
            notes: lastPatrol.notes ?? undefined,
          }
        : undefined,
    }
  })

  const displayCheckpoints = checkpoints

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

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-8">Loading checkpoints...</div>
  }

  if (error) {
    return <div className="text-center text-destructive py-8">Unable to load checkpoint status. Please try again.</div>
  }

  if (displayCheckpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-foreground">No checkpoints set up yet</h3>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Add patrol checkpoints for this site before monitoring staff patrol activity.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">You can configure checkpoints by contacting the admin.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayCheckpoints.map((checkpoint) => (
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

      <Dialog open={!!selectedCheckpoint} onOpenChange={() => setSelectedCheckpoint(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedCheckpoint?.name}</DialogTitle>
          </DialogHeader>
          {selectedCheckpoint && (
            <div className="space-y-4 overflow-y-auto pr-4">
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

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Evidence</p>
                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      Evidence photos are not available for this patrol record.
                    </div>
                  </div>

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
