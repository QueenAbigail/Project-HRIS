'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, Clock, CheckCircle2, AlertCircle, Minus, Move, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    distanceMeters: number | null
    photosCount: number
    notes?: string
    evidence?: string[]
  }
  status: 'completed' | 'pending' | 'overdue'
}

export function CheckpointStatusDashboard({ siteId }: { siteId: string }) {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointStatus | null>(null)
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)
  const [evidenceZoom, setEvidenceZoom] = useState(1)
  const [evidencePan, setEvidencePan] = useState({ x: 0, y: 0 })
  const [isDraggingEvidence, setIsDraggingEvidence] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
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
    distanceMeters: number | null
    photos: number
    notes: string | null
    evidence: string[]
  }>>(
    siteId && locations?.length
      ? `/api/patrol/records?siteId=${encodeURIComponent(siteId)}&date=today`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: latestRecords } = useSWR<Array<{
    locationId: string
    officer: string
    timestamp: string
    gpsVerified: boolean
    distanceMeters: number | null
    photos: number
    notes: string | null
    evidence: string[]
  }>>(
    siteId && locations?.length
      ? `/api/patrol/records?siteId=${encodeURIComponent(siteId)}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const error = locationsError || recordsError
  const isLoading = locationsLoading || (locations !== undefined && locations.length > 0 && recordsLoading)

  useEffect(() => {
    if (error) {
      toast.error('Checkpoint status could not be loaded', {
        description: 'Please check your connection or contact an administrator if the problem continues.',
      })
    }
  }, [error])

  const checkpoints: CheckpointStatus[] = (locations ?? []).map((location) => {
    const lastPatrol = records?.find((record) => record.locationId === location.id)
    const latestPatrol = latestRecords?.find((record) => record.locationId === location.id)
    const displayPatrol = lastPatrol ?? latestPatrol
    return {
      id: location.id,
      name: location.name,
      status: lastPatrol ? 'completed' : 'pending',
      lastPatrol: displayPatrol
        ? {
            officer: displayPatrol.officer,
            time: new Date(displayPatrol.timestamp).toLocaleTimeString('en-GB', {
              timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
            }),
            gpsVerified: displayPatrol.gpsVerified,
            distanceMeters: displayPatrol.distanceMeters,
            photosCount: displayPatrol.photos,
            notes: displayPatrol.notes ?? undefined,
            evidence: displayPatrol.evidence,
          }
        : undefined,
    }
  })

  const displayCheckpoints = checkpoints

  const resetEvidenceView = () => {
    setEvidenceZoom(1)
    setEvidencePan({ x: 0, y: 0 })
  }

  const openEvidence = (imageUrl: string) => {
    setSelectedEvidence(imageUrl)
    resetEvidenceView()
  }

  const changeEvidenceZoom = (delta: number) => {
    setEvidenceZoom((current) => {
      const nextZoom = Math.min(5, Math.max(1, Number((current + delta).toFixed(1))))
      if (nextZoom === 1) setEvidencePan({ x: 0, y: 0 })
      return nextZoom
    })
  }

  const closeEvidence = () => {
    setSelectedEvidence(null)
    resetEvidenceView()
  }

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
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Today&apos;s checkpoint status</p>
          <p className="text-xs text-muted-foreground">Only patrols recorded today are included. The latest patrol is shown when a checkpoint has multiple reports.</p>
        </div>
        <Badge variant="outline" className="shrink-0">{new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())}</Badge>
      </div>
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
                  {selectedCheckpoint.status === 'pending' && (
                    <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
                      No patrol was recorded today. Showing the latest available patrol for testing and reference.
                    </div>
                  )}
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

                  {!selectedCheckpoint.lastPatrol.gpsVerified && selectedCheckpoint.lastPatrol.distanceMeters !== null && (
                    <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
                      <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
                        Distance from checkpoint: <span className="font-semibold">{selectedCheckpoint.lastPatrol.distanceMeters.toLocaleString('en-US')} m</span>
                      </p>
                    </div>
                  )}

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
                    {selectedCheckpoint.lastPatrol.evidence?.length ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {selectedCheckpoint.lastPatrol.evidence.map((imageUrl) => (
                          <button key={imageUrl} type="button" className="group relative overflow-hidden rounded-lg border bg-muted focus:outline-none focus:ring-2 focus:ring-ring" onClick={() => openEvidence(imageUrl)} aria-label="Inspect patrol evidence">
                            <img src={imageUrl} alt="Patrol evidence" className="aspect-[3/4] w-full object-contain transition-opacity group-hover:opacity-75" />
                            <span className="absolute inset-x-2 bottom-2 rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">Click to zoom</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                        Evidence photos are not available for this patrol record.
                      </div>
                    )}
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

      <Dialog open={!!selectedEvidence} onOpenChange={closeEvidence}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Patrol Evidence</DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">Zoom in to inspect details. Drag the image when zoomed.</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => changeEvidenceZoom(-0.25)} disabled={evidenceZoom <= 1} aria-label="Zoom out"><Minus className="size-4" /></Button>
                <span className="min-w-12 text-center text-xs font-medium tabular-nums">{Math.round(evidenceZoom * 100)}%</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => changeEvidenceZoom(0.25)} disabled={evidenceZoom >= 5} aria-label="Zoom in"><Plus className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" onClick={resetEvidenceView} disabled={evidenceZoom === 1 && evidencePan.x === 0 && evidencePan.y === 0} aria-label="Reset image view"><RotateCcw className="size-4" /></Button>
              </div>
            </div>
          </DialogHeader>
          {selectedEvidence && (
            <div
              className={`relative flex h-[min(72vh,680px)] items-center justify-center overflow-hidden bg-muted/40 p-4 ${evidenceZoom > 1 ? (isDraggingEvidence ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
              onWheel={(event) => { event.preventDefault(); changeEvidenceZoom(event.deltaY < 0 ? 0.25 : -0.25) }}
              onPointerDown={(event) => { if (evidenceZoom <= 1) return; event.currentTarget.setPointerCapture(event.pointerId); setIsDraggingEvidence(true); setDragStart({ x: event.clientX - evidencePan.x, y: event.clientY - evidencePan.y }) }}
              onPointerMove={(event) => { if (isDraggingEvidence) setEvidencePan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y }) }}
              onPointerUp={() => setIsDraggingEvidence(false)}
              onPointerCancel={() => setIsDraggingEvidence(false)}
            >
              <img src={selectedEvidence} alt="Full patrol evidence" draggable={false} className="max-h-full max-w-full select-none rounded-lg object-contain shadow-sm transition-transform duration-150" style={{ transform: `translate(${evidencePan.x}px, ${evidencePan.y}px) scale(${evidenceZoom})` }} />
              {evidenceZoom === 1 && <div className="pointer-events-none absolute bottom-6 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm"><Move className="size-3.5" /> Use the controls or mouse wheel to zoom</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
