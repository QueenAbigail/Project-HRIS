'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { AttendanceHeader } from '@/components/attendance/attendance-header'
import { AttendanceStats } from '@/components/attendance/attendance-stats'
import { AttendanceTable } from '@/components/attendance/attendance-table'
import { Button } from '@/components/ui/button'
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
  const [selectedSite, setSelectedSite] = useState(() => searchParams.get('site') ?? 'all')

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
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const handleDateRangeChange = (range: string, dateFrom?: string, dateTo?: string) => {
    setDateRange(range)
    if (dateFrom) setCustomDateFrom(dateFrom)
    if (dateTo) setCustomDateTo(dateTo)
  }
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
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        toast.error('Unable to generate attendance records. Please try again.')
        return
      }

      const data = await response.json()
      toast.success(data.message)
      // Trigger re-fetch by updating the refresh key instead of full reload
      setRefreshKey(prev => prev + 1)
    } catch {
      toast.error('Unable to generate attendance records. Please check your connection and try again.')
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
      } catch {
        // Keep the page usable with its loading and empty states when data fails to load.
      } finally {
        setLoadingSites(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <AttendanceHeader 
        siteId={selectedSite} 
        dateRange={dateRange}
        customDateFrom={customDateFrom}
        customDateTo={customDateTo}
        onDateRangeChange={handleDateRangeChange}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        isClient={isClient}
        isGeneratingAttendance={isGeneratingAttendance}
        onGenerateAttendance={handleGenerateAttendance}
      />

      <AttendanceStats refreshKey={refreshKey} siteId={selectedSite} dateRange={dateRange} customDateFrom={customDateFrom} customDateTo={customDateTo} department={selectedDepartment} />
      <AttendanceTable refreshKey={refreshKey} siteId={selectedSite} dateRange={dateRange} customDateFrom={customDateFrom} customDateTo={customDateTo} department={selectedDepartment} sites={sites} loadingSites={loadingSites} onSiteChange={handleSiteChange} />
    </div>
  )
}
