import { MapPin, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SiteMarkerPopupProps {
  name: string
  code: string
  latitude: number
  longitude: number
  totalStaff: number
  presentCount: number
  lateCount: number
  absentCount: number
}

export function SiteMarkerPopup({
  name,
  code,
  latitude,
  longitude,
  totalStaff,
  presentCount,
  lateCount,
  absentCount,
}: SiteMarkerPopupProps) {
  const occupancyRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 0

  const handleOpenStreetView = () => {
    const streetViewUrl = `https://www.google.com/maps/@${latitude},${longitude},3a,75y,0h,90t/data=!3m4!1e1!3m2!1s!2e0!7i13312!8i6656`
    window.open(streetViewUrl, '_blank')
  }

  return (
    <div className="w-80 space-y-3 p-3">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded">
            {code}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 pb-2 border-t border-b border-border/50">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Total Staff</div>
          <div className="text-lg font-semibold">{totalStaff}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Occupancy Rate</div>
          <div className="text-lg font-semibold text-green-600">{occupancyRate}%</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Present</div>
          <div className="text-lg font-semibold text-green-600">{presentCount}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Absent</div>
          <div className="text-lg font-semibold text-red-600">{absentCount}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Late Check-in</div>
          <div className="text-lg font-semibold text-orange-600">{lateCount}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Not Checked In</div>
          <div className="text-lg font-semibold text-gray-600">{totalStaff - presentCount - absentCount}</div>
        </div>
      </div>

      {/* Street View Button */}
      <Button
        onClick={handleOpenStreetView}
        className="w-full gap-2 h-9 text-sm"
        variant="default"
      >
        <ExternalLink className="w-4 h-4" />
        View Street View
      </Button>
    </div>
  )
}
