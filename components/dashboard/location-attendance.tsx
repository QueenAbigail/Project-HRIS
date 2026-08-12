'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, Users, UserCheck, UserX, Clock, AlertTriangle, CalendarOff, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface CompanyAttendanceData {
  companyId: string
  companyName: string
  totalStaff: number
  present: number
  absent: number
  late: number
  lateMinutesTotal: number
  notCheckedIn: number
  onLeave: number
  dayOff: number
  expectedToWork: number
  attendanceRate: number
  sites: Array<any>
}

interface LocationAttendanceProps {
  locationData?: CompanyAttendanceData[]
  companyName?: string
  isClient?: boolean
}

export function LocationAttendance({ locationData, companyName = 'all', isClient = false }: LocationAttendanceProps) {
  const router = useRouter()

  const handleLocationClick = (siteId: string) => {
    router.push(`/dashboard/attendance?site=${siteId}`)
  }

  // Filter to only show client's company if CLIENT role
  const filteredData = isClient ? locationData?.filter(company => company.companyName === companyName) : locationData

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Attendance by Location
          </CardTitle>
          <CardDescription>Real-time status across all {isClient ? `${companyName}` : 'client'} sites</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Belum ada data attendance</p>
            <p className="text-sm text-muted-foreground">Lokasi akan muncul setelah data tersedia</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals from all companies
  const totals = {
    totalStaff: filteredData.reduce((acc, company) => acc + company.totalStaff, 0),
    present: filteredData.reduce((acc, company) => acc + company.present + company.late, 0),
    absent: filteredData.reduce((acc, company) => acc + company.absent, 0),
    late: filteredData.reduce((acc, company) => acc + company.late, 0),
    notCheckedIn: filteredData.reduce((acc, company) => acc + company.notCheckedIn, 0),
    onLeave: filteredData.reduce((acc, company) => acc + company.onLeave, 0),
    dayOff: filteredData.reduce((acc, company) => acc + company.dayOff, 0),
    expectedToWork: filteredData.reduce((acc, company) => acc + company.expectedToWork, 0),
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Attendance by Location
            </CardTitle>
            <CardDescription>Real-time status across all {isClient ? `${companyName}` : 'client'} sites</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">Late</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">Not Checked In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-primary/50" />
              <span className="text-muted-foreground">Day Off</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totals.totalStaff}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
              <UserCheck className="size-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{totals.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="size-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{totals.late}</p>
              <p className="text-xs text-muted-foreground">Late Check-Ins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <UserX className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{totals.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">{totals.notCheckedIn}</p>
              <p className="text-xs text-muted-foreground">Not Checked In</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarOff className="size-5 text-primary/70" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary/70">{totals.dayOff}</p>
              <p className="text-xs text-muted-foreground">Day Off</p>
            </div>
          </div>
        </div>

        {/* Avg Late Minutes Alert */}
        {totals.late > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="size-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {totals.late} late check-ins today
              </p>
              <p className="text-xs text-muted-foreground">
                Average delay: 0 minutes | Total late time: 0 minutes
              </p>
            </div>
          </div>
        )}

        {/* Location Breakdown by Company */}
        <Accordion type="single" collapsible className="w-full">
          {filteredData.map((company) => {
            const companyAttendanceRate = company.attendanceRate
            const companyHasLateCheckIns = company.late > 0

            return (
              <AccordionItem key={company.companyId} value={company.companyId} className="border-b">
                <AccordionTrigger className="hover:no-underline p-4 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="size-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="size-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{company.companyName}</p>
                        <p className="text-xs text-muted-foreground">{company.sites.length} location{company.sites.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {companyHasLateCheckIns && (
                        <Badge 
                          variant="outline" 
                          className="bg-warning/10 text-warning border-warning/20"
                        >
                          {company.late} late
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          companyAttendanceRate >= 90
                            ? 'bg-success/10 text-success border-success/20'
                            : companyAttendanceRate >= 75
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }
                      >
                        {companyAttendanceRate}% Present
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="space-y-3 p-4 pt-0">
                    {/* Company Summary Stats */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 mb-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{company.present}</p>
                        <p className="text-xs text-muted-foreground">Present</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-warning">{company.late}</p>
                        <p className="text-xs text-muted-foreground">Late</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-destructive">{company.absent}</p>
                        <p className="text-xs text-muted-foreground">Absent</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-2xl font-bold text-muted-foreground">{company.dayOff}</p>
                        <p className="text-xs text-muted-foreground">Day Off</p>
                      </div>
                    </div>

                    {/* Individual Sites */}
                    <div className="space-y-2">
                      {company.sites.map((site) => {
                        const hasLateCheckIns = site.late > 0
                        const hasDayOff = site.dayOff > 0
                        return (
                        <button
                          onClick={() => handleLocationClick(site.siteId)}
                          key={site.siteId}
                            className={`w-full text-left p-3 rounded-lg border bg-secondary/20 hover:bg-secondary/40 hover:border-primary/50 transition-all cursor-pointer ${
                              hasLateCheckIns ? 'border-warning/30' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="size-3 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-sm">{site.locationName}</p>
                                  <p className="text-xs text-muted-foreground">{site.locationId}</p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  site.attendanceRate >= 90
                                    ? 'bg-success/10 text-success border-success/20 text-xs'
                                    : site.attendanceRate >= 75
                                    ? 'bg-warning/10 text-warning border-warning/20 text-xs'
                                    : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'
                                }
                              >
                                {site.attendanceRate}%
                              </Badge>
                            </div>
                            <Progress value={site.attendanceRate} className="h-1.5" />
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <UserCheck className="size-2" />
                                {site.present}
                              </span>
                              {hasLateCheckIns && (
                                <span className="flex items-center gap-1 text-warning">
                                  <AlertTriangle className="size-2" />
                                  {site.late}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <UserX className="size-2" />
                                {site.absent}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-2" />
                                {site.notCheckedIn}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
