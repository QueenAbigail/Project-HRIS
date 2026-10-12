'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, ChevronDown, Minus, Move, Plus, RotateCcw } from 'lucide-react'
import { getBusinessDate } from '@/lib/timezone'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PatrolRecord {
  id: string
  checkpoint: string
  officer: string
  timestamp: string
  time?: string
  date: string
  gpsStatus: 'verified' | 'unverified'
  distanceMeters: number | null
  photos: number
  description: string
  evidence: string[]
}

export function PatrolTimelineView({ siteId }: { siteId: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [patrols, setPatrols] = useState<PatrolRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => getBusinessDate())

  useEffect(() => {
    const fetchPatrols = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(`/api/patrol/records?siteId=${encodeURIComponent(siteId)}&date=${encodeURIComponent(selectedDate)}`)
        if (!response.ok) throw new Error('Patrol records request failed')
        const data = await response.json()
        setPatrols(data)
        setHasError(false)
      } catch {
        setHasError(true)
        toast.error('Patrol records could not be loaded', {
          description: 'Please check your connection or contact an administrator if the problem continues.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (!siteId) return

    fetchPatrols()
  }, [siteId, selectedDate])

  const resetPhotoView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const openPhoto = (photo: string) => {
    setSelectedPhoto(photo)
    resetPhotoView()
  }

  const changeZoom = (delta: number) => {
    setZoom((current) => {
      const nextZoom = Math.min(5, Math.max(1, Number((current + delta).toFixed(1))))
      if (nextZoom === 1) setPan({ x: 0, y: 0 })
      return nextZoom
    })
  }

  const timelineFilter = (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-foreground">Patrol timeline</p>
        <p className="text-sm text-muted-foreground">View patrol reports for a specific date.</p>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <CalendarDays className="size-4 text-primary" aria-hidden="true" />
        <span className="sr-only">Patrol date</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="h-10 rounded-md border bg-background px-3 font-normal shadow-sm outline-none focus:ring-2 focus:ring-ring"
          aria-label="Patrol date"
        />
      </label>
    </div>
  )

  if (isLoading) return <div className="space-y-4">{timelineFilter}<div className="py-8 text-center text-muted-foreground">Loading patrol records...</div></div>
  if (hasError) return <div className="space-y-4">{timelineFilter}<div className="py-8 text-center text-sm text-muted-foreground">Patrol records could not be loaded for this date.</div></div>
  if (patrols.length === 0) {
    return <div className="space-y-4">{timelineFilter}<div className="py-12 text-center text-muted-foreground"><p>No patrol records found for this date.</p><p className="mt-2 text-sm">Try another date to view completed patrols.</p></div></div>
  }

  return (
    <div className="space-y-4">
      {timelineFilter}
      {patrols.map((patrol) => (
        <Card
          key={patrol.id}
          className="border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => setExpandedId(expandedId === patrol.id ? null : patrol.id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-semibold text-card-foreground">{patrol.checkpoint}</h3>
                <Badge
                  className={
                    patrol.gpsStatus === 'verified'
                      ? 'bg-success'
                      : 'bg-warning text-warning-foreground'
                  }
                >
                  {patrol.gpsStatus === 'verified' ? 'GPS Verified' : 'GPS Unverified'}
                </Badge>
                {patrol.gpsStatus === 'unverified' && patrol.distanceMeters !== null && (
                  <span className="text-xs font-medium text-warning-foreground">
                    {patrol.distanceMeters.toLocaleString('en-US')} m from checkpoint
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Officer:</span> {patrol.officer}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Time:</span> {patrol.time ?? patrol.timestamp} · {patrol.date}
                </p>
              </div>

              {expandedId === patrol.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Observation:</p>
                    <p className="text-sm text-muted-foreground">{patrol.description}</p>
                  </div>

                  {patrol.evidence.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Evidence ({patrol.photos} photos)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {patrol.evidence.map((photo, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation()
openPhoto(photo)
                            }}
                            className="relative group aspect-[3/4] w-full max-w-32 overflow-hidden rounded-lg bg-muted"
                          >
                            <img
                              src={photo}
                              alt={`Evidence ${idx + 1}`}
                              className="h-full w-full object-contain group-hover:opacity-75 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                                View
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setExpandedId(expandedId === patrol.id ? null : patrol.id)
              }}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expandedId === patrol.id ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
        </Card>
      ))}

      {/* Photo Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => { setSelectedPhoto(null); resetPhotoView() }}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Patrol Evidence</DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">Zoom in to inspect details. Drag the image when zoomed.</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => changeZoom(-0.25)} disabled={zoom <= 1} aria-label="Zoom out">
                  <Minus className="size-4" />
                </Button>
                <span className="min-w-12 text-center text-xs font-medium tabular-nums">{Math.round(zoom * 100)}%</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => changeZoom(0.25)} disabled={zoom >= 5} aria-label="Zoom in">
                  <Plus className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={resetPhotoView} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} aria-label="Reset image view">
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedPhoto && (
            <div
              className={`relative flex h-[min(72vh,680px)] items-center justify-center overflow-hidden bg-muted/40 p-4 ${zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
              onWheel={(event) => {
                event.preventDefault()
                changeZoom(event.deltaY < 0 ? 0.25 : -0.25)
              }}
              onPointerDown={(event) => {
                if (zoom <= 1) return
                event.currentTarget.setPointerCapture(event.pointerId)
                setIsDragging(true)
                setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y })
              }}
              onPointerMove={(event) => {
                if (!isDragging) return
                setPan({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y })
              }}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
            >
              <img
                src={selectedPhoto}
                alt="Full evidence"
                draggable={false}
                className="max-h-full max-w-full select-none rounded-lg object-contain shadow-sm transition-transform duration-150"
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              />
              {zoom === 1 && <div className="pointer-events-none absolute bottom-6 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm"><Move className="size-3.5" /> Use the controls or mouse wheel to zoom</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
