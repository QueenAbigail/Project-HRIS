'use client'

import { useState } from 'react'
import { AttendanceHeader } from '@/components/attendance/attendance-header'
import { AttendanceStats } from '@/components/attendance/attendance-stats'
import { AttendanceTable } from '@/components/attendance/attendance-table'
import { AttendanceCalendar } from '@/components/attendance/attendance-calendar'
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
  const [selectedSite, setSelectedSite] = useState('all')

  return (
    <div className="space-y-6">
      <AttendanceHeader />

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
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceTable siteId={selectedSite} />
        </div>
        <div className="lg:col-span-1">
          <AttendanceCalendar siteId={selectedSite} />
        </div>
      </div>
    </div>
  )
}
