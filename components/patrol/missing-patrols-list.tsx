'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface PatrolLocation {
  id: string
  name: string
}

interface PatrolRecord {
  locationId: string
  timestamp: string
}

interface MissingPatrolsListProps {
  siteId: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to load patrol records')
  return response.json()
}

export function MissingPatrolsList({ siteId }: MissingPatrolsListProps) {
  const { data: locations, error: locationsError, isLoading: locationsLoading } = useSWR<PatrolLocation[]>(
    siteId ? `/api/patrol/locations?siteId=${encodeURIComponent(siteId)}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )
  const { data: records, error: recordsError, isLoading: recordsLoading } = useSWR<PatrolRecord[]>(
    siteId && locations?.length
      ? `/api/patrol/records?siteId=${encodeURIComponent(siteId)}`
      : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const isLoading = locationsLoading || recordsLoading
  const error = locationsError || recordsError

  useEffect(() => {
    if (error) {
      toast.error('Missing patrol status could not be loaded', {
        description: 'Please check your connection or contact an administrator if the problem continues.',
      })
    }
  }, [error])

  const today = new Date().toISOString().slice(0, 10)
  const completedLocationIds = new Set(
    (records ?? [])
      .filter((record) => record.timestamp.slice(0, 10) === today)
      .map((record) => record.locationId),
  )
  const missingLocations = (locations ?? []).filter((location) => !completedLocationIds.has(location.id))

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
            Patrols Not Yet Completed
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Checkpoints without a patrol record for today
          </p>
        </div>
        <Badge variant="secondary">{missingLocations.length} Missing</Badge>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading patrol status...</div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-destructive">Unable to load patrol status. Please try again.</div>
      ) : missingLocations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          <p className="font-medium text-foreground">All checkpoints have been patrolled today.</p>
          <p className="text-sm text-muted-foreground">No missing patrol records were found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {missingLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4"
            >
              <MapPin className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              <p className="flex-1 font-medium text-card-foreground">{location.name}</p>
              <Badge variant="outline" className="border-warning/50 text-warning">Pending</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
