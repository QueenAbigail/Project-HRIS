'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MissingPatrol {
  id: string
  officer: string
  shift: string
  expectedTime: string
  assignedLocation: string
}

interface MissingPatrolsListProps {
  siteId: string
}

// Mock data - in real implementation, fetch from database comparing shift schedules with patrol records
const mockMissingByShift: Record<string, MissingPatrol[]> = {
  'morning': [
    {
      id: '1',
      officer: 'John Doe',
      shift: 'Morning (6AM - 2PM)',
      expectedTime: 'By 8:00 AM',
      assignedLocation: 'Gate Entrance',
    },
    {
      id: '2',
      officer: 'Mike Johnson',
      shift: 'Morning (6AM - 2PM)',
      expectedTime: 'By 8:30 AM',
      assignedLocation: 'Perimeter South',
    },
  ],
  'afternoon': [
    {
      id: '3',
      officer: 'Sarah Williams',
      shift: 'Afternoon (2PM - 10PM)',
      expectedTime: 'By 2:30 PM',
      assignedLocation: 'Back Gate',
    },
  ],
  'night': [],
}

export function MissingPatrolsList({ siteId }: MissingPatrolsListProps) {
  const totalMissing = Object.values(mockMissingByShift).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Patrols Not Yet Completed
          </h3>
          <Badge variant="secondary">{totalMissing} Missing</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Officers who haven&apos;t completed their assigned patrol checks by their shift schedule
        </p>
      </div>

      {totalMissing === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">All scheduled patrols have been completed!</p>
        </div>
      ) : (
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="morning" className="relative">
              Morning
              {mockMissingByShift.morning.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-600">
                  {mockMissingByShift.morning.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="afternoon" className="relative">
              Afternoon
              {mockMissingByShift.afternoon.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-600">
                  {mockMissingByShift.afternoon.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="night" className="relative">
              Night
              {mockMissingByShift.night.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-600">
                  {mockMissingByShift.night.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {Object.entries(mockMissingByShift).map(([shiftKey, missing]) => (
            <TabsContent key={shiftKey} value={shiftKey} className="space-y-3">
              {missing.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  All {shiftKey} shift officers have completed their patrols
                </div>
              ) : (
                missing.map((patrol) => (
                  <div
                    key={patrol.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-amber-700" />
                        <p className="font-semibold text-card-foreground">{patrol.officer}</p>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{patrol.expectedTime}</span>
                        </div>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Location:</span> {patrol.assignedLocation}
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-amber-700 border-amber-300">
                      Pending
                    </Badge>
                  </div>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </Card>
  )
}
