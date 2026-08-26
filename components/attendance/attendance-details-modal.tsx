'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Clock, Camera, AlertTriangle, Loader2 } from 'lucide-react'
import { getAttendanceLabel, getStatusStyles } from '@/lib/attendance-utils'
import { BUSINESS_TIMEZONE } from '@/lib/timezone'
import type { Attendance } from '@prisma/client'
import dynamic from 'next/dynamic'

// Lazy load Leaflet map component
const AttendanceMap = dynamic(() => import('./attendance-map'), {
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center"><Loader2 className="size-8 text-muted-foreground animate-spin" /></div>,
  ssr: false
})

interface AttendanceDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: (Attendance & { user: any; location: any }) | null
}

export function AttendanceDetailsModal({ open, onOpenChange, record }: AttendanceDetailsModalProps) {
  const selfieKey = open && record?.selfieCheckIn
    ? `/api/attendance/image?attendanceId=${encodeURIComponent(record.id)}`
    : null
  const { data: selfieData, isLoading: loadingImages, error: selfieFetchError } = useSWR<{ url: string }>(
    selfieKey,
    async (url) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Selfie unavailable')
      return response.json()
    },
    { revalidateOnFocus: false }
  )
  const selfieCheckIn = selfieData?.url ?? null
  const [selfieCheckInError, setSelfieCheckInError] = useState<string | null>(null)

  // Clear images when modal closes to avoid memory leaks
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setSelfieCheckInError(null)
    }
    onOpenChange(newOpen)
  }, [onOpenChange])

  if (!record) return null

  const formatTime = (timestamp: string | Date) => {
    try {
      const value = timestamp instanceof Date ? timestamp.toISOString() : timestamp
      // Prisma/JSON may return a local wall-clock timestamp without an offset.
      // Treat it as already being in Jakarta rather than converting it twice.
      const timezoneLessMatch = value.match(/T(\d{2}:\d{2}(?::\d{2})?)(?:\.\d+)?$/)
      if (timezoneLessMatch) return timezoneLessMatch[1]

      return new Date(value).toLocaleTimeString('en-GB', {
        timeZone: BUSINESS_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    } catch {
      return String(timestamp)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto [&_script]:hidden" suppressHydrationWarning>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            Attendance Details
          </DialogTitle>
          <DialogDescription>
            {record.date && new Date(record.date).toLocaleDateString('en-US', { timeZone: BUSINESS_TIMEZONE, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </DialogDescription>
        </DialogHeader>

        {record && (
          <div className="space-y-6">
            {/* Employee Info Card */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {record.user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{record.user.name}</p>
                <p className="text-sm text-muted-foreground">{record.user.email}</p>
                <p className="text-xs text-muted-foreground">{record.location?.name || 'Unknown Location'}</p>
              </div>
              <Badge variant="outline" className={getStatusStyles(record.status)}>
                {getAttendanceLabel(record.status)}
              </Badge>
            </div>

            {/* Schedule Info */}
            {record.scheduledStart && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg bg-card">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="size-3" />
                    Scheduled
                  </p>
                  <p className="font-semibold text-sm">{record.scheduledStart} - {record.scheduledEnd || 'N/A'}</p>
                </div>
                {record.lateMinutes > 0 && (
                  <div className="p-3 border rounded-lg bg-warning/5 border-warning/20">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      Late
                    </p>
                    <p className="font-semibold text-sm text-warning">{record.lateMinutes} minutes</p>
                  </div>
                )}
              </div>
            )}

            {/* Check-in Section */}
            {record.actualCheckIn ? (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Clock className="size-5" />
                  Check-In: {formatTime(record.actualCheckIn)}
                </h3>

                <div className="space-y-4">
                  {/* Check-in Selfie */}
                  {record.selfieCheckIn && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                        <Camera className="size-4" />
                        Selfie Verification
                      </p>
                      {loadingImages ? (
                        <div className="w-full max-w-xs h-64 rounded-lg border bg-muted/50 flex items-center justify-center">
                          <Loader2 className="size-6 text-muted-foreground animate-spin" aria-label="Loading selfie" />
                        </div>
                      ) : selfieFetchError || selfieCheckInError === record.id || !selfieCheckIn ? (
                        <div className="w-full max-w-xs h-64 rounded-lg border bg-muted/50 flex items-center justify-center text-center p-4">
                          <div>
                            <Camera className="size-8 text-muted-foreground mb-2 mx-auto" />
                            <p className="text-xs text-muted-foreground">Image not available</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={selfieCheckIn}
                          alt="Check-in selfie"
                          className="w-full max-w-xs rounded-lg border object-cover"
                          onError={() => setSelfieCheckInError(record.id)}
                        />
                      )}
                    </div>
                  )}

                  {/* Check-in GPS Map */}
                  {record.gpsLat && record.gpsLng && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                        <MapPin className="size-4" />
                        Location (Check-In)
                      </p>
                      <AttendanceMap
                        lat={record.gpsLat}
                        lng={record.gpsLng}
                        label="Check-In Location"
                        markerColor="#22c55e"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lat: {record.gpsLat.toFixed(6)} | Lng: {record.gpsLng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-lg text-center bg-muted/20">
                <p className="text-sm text-muted-foreground">No check-in recorded for this date</p>
              </div>
            )}

            {/* Check-out Section */}
            {record.actualCheckOut ? (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Clock className="size-5" />
                  Check-Out: {formatTime(record.actualCheckOut)}
                </h3>

                <div className="space-y-4">
                  {/* Check-out GPS Map (no selfie for checkout) */}
                  {record.gpsLatPulang && record.gpsLngPulang && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                        <MapPin className="size-4" />
                        Location (Check-Out)
                      </p>
                      <AttendanceMap
                        lat={record.gpsLatPulang}
                        lng={record.gpsLngPulang}
                        label="Check-Out Location"
                        markerColor="#f59e0b"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lat: {record.gpsLatPulang.toFixed(6)} | Lng: {record.gpsLngPulang.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-lg text-center bg-muted/20">
                <p className="text-sm text-muted-foreground">No check-out recorded for this date</p>
              </div>
            )}

            {/* Notes Section */}
            {record.notes && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-semibold mb-2">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
