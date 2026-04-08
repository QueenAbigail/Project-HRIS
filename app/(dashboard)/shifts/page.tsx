'use client'

import { useState } from 'react'
import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CalendarDays,
  Plus, 
  Download, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle,
  Sun,
  Sunset,
  Moon,
  Settings,
  Users as UsersIcon
} from 'lucide-react'
import { 
  formatTime,
  getLateCheckIns,
  getShiftEmployees,
  getShiftStats,
} from '@/lib/data'
import { ShiftFormDialog } from '@/components/shifts/ShiftFormDialog'
import { EmployeeAssignmentTable } from '@/components/shifts/EmployeeAssignmentTable'
import { EmployeeSwapDialog } from '@/components/shifts/EmployeeSwapDialog'
import { Toaster } from '@/components/ui/toaster'

const shiftIcons = {
  morning: Sun,
  day: Sun,
  evening: Sunset,
  night: Moon,
} as const

export default function ShiftsPage() {
  const [createShiftOpen, setCreateShiftOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [swapOpen, setSwapOpen] = useState(false)
  const lateCheckIns = getLateCheckIns()
  const shifts = useSchedulesStore(state => state.shifts)

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shift Schedule</h1>
            <p className="text-muted-foreground">
              Manage shifts, assignments, and employee swaps with real-time attendance tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
            <Button onClick={() => setCreateShiftOpen(true)}>
              <Plus className="mr-2 size-4" />
              Create Shift
            </Button>
          </div>
        </div>

        {/* Late Check-ins Alert */}
        {lateCheckIns.length > 0 && (
          <Card className="bg-warning/5 border-warning/30">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {lateCheckIns.length} late check-ins today
                </p>
                <p className="text-sm text-muted-foreground">
                  {lateCheckIns.slice(0, 3).map(l => l.employeeName).join(', ')}
                  {lateCheckIns.length > 3 && ` and ${lateCheckIns.length - 3} more`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Clock className="mr-2 size-4 h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Settings className="mr-2 size-4 h-4 w-4" />
              <span>Manage Shifts</span>
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <UsersIcon className="mr-2 size-4 h-4 w-4" />
              <span>Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="swaps" className="justify-start">
              <Users className="mr-2 size-4 h-4 w-4" />
              <span>Quick Swaps</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Existing */}
          <TabsContent value="overview" className="space-y-6">
            {/* Shift Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shifts.map((shift) => {
                const stats = getShiftStats(shift.id)
                const ShiftIcon = shiftIcons[shift.id as keyof typeof shiftIcons] || Clock
                const hasLate = stats.late > 0

                return (
                  <Card 
                    key={shift.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${hasLate ? 'ring-1 ring-warning/50' : ''}`}
                    onClick={() => setActiveTab('manage')}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShiftIcon className="size-4 text-primary" />
                          </div>
                          <CardTitle className="text-base">{shift.name}</CardTitle>
                        </div>
                        {hasLate && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                            {stats.late} late
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-mono">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Grace</span>
                          <span>{shift.gracePeriodMinutes} min</span>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {stats.total} assigned
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-success">{stats.present}</span>
                              <span className="text-warning">{stats.late}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Manage Shifts Tab */}
          <TabsContent value="manage">
            <ShiftFormDialog 
              open={createShiftOpen} 
              onOpenChange={setCreateShiftOpen}
            />
            {/* Shift list with edit/delete */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Shifts</h3>
              {shifts.map(shift => (
                <Card key={shift.id}>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <h4 className="font-medium">{shift.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)} | {shift.gracePeriodMinutes}min grace
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <EmployeeAssignmentTable />
          </TabsContent>

          {/* Swaps Tab */}
          <TabsContent value="swaps" className="p-6">
            <EmployeeSwapDialog open={swapOpen} onOpenChange={setSwapOpen} />
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto size-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick Employee Swaps</h3>
              <p>Use the swap dialog for fast schedule changes with automatic attendance adjustment</p>
              <Button onClick={() => setSwapOpen(true)} className="mt-4">
                Start Swap
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </>
  )
}

