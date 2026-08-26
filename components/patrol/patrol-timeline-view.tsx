'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
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
  photos: number
  description: string
  evidence: string[]
}

export function PatrolTimelineView({ siteId }: { siteId: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [patrols, setPatrols] = useState<PatrolRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const fetchPatrols = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await fetch(`/api/patrol/records?siteId=${encodeURIComponent(siteId)}`)
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
  }, [siteId])

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-8">Loading patrol records...</div>
  }

  if (hasError) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Patrol records are temporarily unavailable.</div>
  }

  if (patrols.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>No patrol records found for this site.</p>
        <p className="text-sm mt-2">Patrol records will appear here as officers complete their rounds.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
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
                              setSelectedPhoto(photo)
                            }}
                            className="relative group overflow-hidden rounded-lg bg-muted"
                          >
                            <img
                              src={photo}
                              alt={`Evidence ${idx + 1}`}
                              className="w-full h-24 object-cover group-hover:opacity-75 transition-opacity"
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
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patrol Evidence</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Full evidence"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
