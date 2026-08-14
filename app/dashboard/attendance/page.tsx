'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { Building2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Site {
  id: string
  name: string
  company?: {
    name: string
  } | null
}

interface CurrentUser {
  role: string
  companyId?: string
}

export default function AttendancePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedSite, setSelectedSite] = useState('all')

  // Update both local state and the URL query param so the address bar
  // reflects the active site filter (and stays shareable/bookmarkable).
  const handleSiteChange = (value: string) => {
    setSelectedSite(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set('site', value)
    } else {
      params.delete('site')
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }
  const [dateRange, setDateRange] = useState('today')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sites, setSites] = useState<Site[]>([])
  const [loadingSites, setLoadingSites] = useState(true)
  const [isGeneratingAttendance, setIsGeneratingAttendance] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleGenerateAttendance = async () => {
    setIsGeneratingAttendance(true)
    try {
      const response = await fetch('/api/attendance/generate-today', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'development-secret'}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to generate attendance')
        console.error('[v0] Generation failed:', error)
        return
      }

      const data = await response.json()
      toast.success(data.message)
      console.log('[v0] Attendance generation details:', data.details)
      // Trigger re-fetch by updating the refresh key instead of full reload
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('[v0] Error triggering attendance generation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate attendance records')
    } finally {
      setIsGeneratingAttendance(false)
    }
  }

  // Fetch sites from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, sitesResponse] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/sites'),
        ])

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUser(userData)
          setIsClient(userData.role === 'CLIENT')
        }

        if (sitesResponse.ok) {
          const sitesData = await sitesResponse.json()
          setSites(sitesData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoadingSites(false)
      }
    }

    fetchData()
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
      <AttendanceHeader 
        siteId={selectedSite} 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        isClient={isClient}
      />

      {/* Site Filter & Generate Button */}
      <div className="flex items-end gap-4 justify-between">
        <div className="flex-1 max-w-xs">
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2 block">
            <Building2 className="h-4 w-4" />
            Filter by Site
          </label>
          <Select value={selectedSite} onValueChange={handleSiteChange}>
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
        {!isClient && (
          <Button
            onClick={handleGenerateAttendance}
            disabled={isGeneratingAttendance}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Generate pending attendance records for today based on assignments"
          >
            <RefreshCw className={`size-4 ${isGeneratingAttendance ? 'animate-spin' : ''}`} />
            {isGeneratingAttendance ? 'Generating...' : 'Generate Today'}
          </Button>
        )}
      </div>

      <AttendanceStats refreshKey={refreshKey} siteId={selectedSite} dateRange={dateRange} />
      <AttendanceTable refreshKey={refreshKey} siteId={selectedSite} dateRange={dateRange} department={selectedDepartment} />
    </div>
  )
}
