'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AttendanceHeader } from '@/components/attendance/attendance-header'
import { AttendanceStats } from '@/components/attendance/attendance-stats'
import { AttendanceTable } from '@/components/attendance/attendance-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'

// Mock sites - will be replaced with database query
const mockSites = [
  { id: 'all', name: 'All Sites' },
  { id: 'site-1', name: 'Main Gate Site' },
  { id: 'site-2', name: 'Building A' },
  { id: 'site-3', name: 'Building B' },
  { id: 'site-4', name: 'Parking Area' },
]

export default function AttendancePage() {
  const searchParams = useSearchParams()
  const [selectedSite, setSelectedSite] = useState('all')

  useEffect(() => {
    // Set site from query parameter if available
    const siteParam = searchParams.get('site')
    if (siteParam) {
      setSelectedSite(siteParam)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      <AttendanceHeader siteId={selectedSite} />

      {/* Site Filter */}
      <div className="flex items-end gap-4">
        <div className="flex-1 max-w-xs">
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2 block">
            <Building2 className="h-4 w-4" />
            Filter by Site
          </label>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockSites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AttendanceStats siteId={selectedSite} />
      <AttendanceTable siteId={selectedSite} />
    </div>
  )
}
