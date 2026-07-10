'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Download, Users, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { ShiftFormDialog } from '@/components/shifts/ShiftFormDialog'
import { ScheduleImportDialog } from '@/components/shifts/ScheduleImportDialog'
import { ScheduleTable } from '@/components/shifts/ScheduleTable'
import { AddScheduleDialog } from '@/components/shifts/AddScheduleDialog'
import { getShifts, getEmployeeSchedules } from '@/app/superadmin/actions'
import { formatTime } from '@/lib/data'
import { Edit } from 'lucide-react'

export default function SchedulesPage() {
  const [shifts, setShifts] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createShiftOpen, setCreateShiftOpen] = useState(false)
  const [editShiftOpen, setEditShiftOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<any>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [addScheduleOpen, setAddScheduleOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [shiftsData, schedulesData] = await Promise.all([
        getShifts(),
        getEmployeeSchedules(),
      ])
      setShifts(shiftsData || [])
      setSchedules(schedulesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleImportSuccess = () => {
    loadData()
  }

  const handleAddSchedule = (schedule: any) => {
    setEditingSchedule(schedule)
    setAddScheduleOpen(true)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <p className="text-muted-foreground">Manage shifts, import schedules, and handle assignments</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shifts">
            <Clock className="mr-2 size-4" />
            Shifts
          </TabsTrigger>
          <TabsTrigger value="import">
            <Download className="mr-2 size-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Users className="mr-2 size-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        {/* Shifts Tab */}
        <TabsContent value="shifts" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setCreateShiftOpen(true)}>
              <Plus className="mr-2 size-4" />
              Create Shift
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Shift Types</CardTitle>
              <CardDescription>Define shift times and grace periods for your locations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading shifts...</div>
              ) : shifts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="size-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No shifts configured. Create a shift to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shifts.map(shift => (
                    <div key={shift.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition">
                      <div>
                        <h4 className="font-medium">{shift.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)} | {shift.gracePeriodMinutes}min grace
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingShift(shift)
                          setEditShiftOpen(true)
                        }}
                      >
                        <Edit className="size-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ShiftFormDialog
            open={createShiftOpen}
            onOpenChange={setCreateShiftOpen}
          />

          <ShiftFormDialog
            shift={editingShift || undefined}
            open={editShiftOpen}
            onOpenChange={(open) => {
              setEditShiftOpen(open)
              if (!open) setEditingShift(null)
            }}
          />
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setImportDialogOpen(true)}>
              <Download className="mr-2 size-4" />
              Upload Excel
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Import Schedules</CardTitle>
              <CardDescription>Upload an Excel file to import daily schedules for multiple employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground space-y-4">
                <Download className="size-12 mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">Import Daily Rosters</h3>
                <p className="mb-4">Upload an Excel file with employee names and daily shift assignments (P, M, X, OFF)</p>
                <Button onClick={() => setImportDialogOpen(true)}>
                  Select File to Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          <ScheduleImportDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            onSuccess={handleImportSuccess}
          />
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => {
              setEditingSchedule(null)
              setAddScheduleOpen(true)
            }}>
              <Plus className="mr-2 size-4" />
              Add Manual Schedule
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Assignments</CardTitle>
              <CardDescription>View, edit, and manage all employee schedules (imported and manual)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading schedules...</div>
              ) : (
                <ScheduleTable
                  schedules={schedules}
                  onEdit={handleAddSchedule}
                  onDelete={() => loadData()}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>

          <AddScheduleDialog
            open={addScheduleOpen}
            onOpenChange={setAddScheduleOpen}
            schedule={editingSchedule}
            shifts={shifts}
            onSuccess={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
