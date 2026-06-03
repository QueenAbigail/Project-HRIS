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

interface Site {
  id: string
  name: string
  company?: {
    name: string
  } | null
}

export default function AttendancePage() {
  const searchParams = useSearchParams()
  const [selectedSite, setSelectedSite] = useState('all')
  const [sites, setSites] = useState<Site[]>([])
  const [loadingSites, setLoadingSites] = useState(true)

  // Fetch sites from database
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch('/api/sites')
        if (response.ok) {
          const data = await response.json()
          setSites(data)
        }
      } catch (error) {
        console.error('Failed to fetch sites:', error)
      } finally {
        setLoadingSites(false)
      }
    }

    fetchSites()
  }, [])

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
              <SelectValue placeholder={loadingSites ? 'Loading...' : 'Select site'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.company?.name ? `${site.company.name} - ${site.name}` : site.name}
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
