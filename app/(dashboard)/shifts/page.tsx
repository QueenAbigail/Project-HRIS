import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, Download } from 'lucide-react'

export default function ShiftsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shift Schedule</h1>
          <p className="text-muted-foreground">
            Manage and organize security personnel shifts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 size-4" />
            Create Shift
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Current week shift assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-lg">
              <div className="text-center">
                <Calendar className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Shift calendar view</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Shift Summary</CardTitle>
            <CardDescription>Today&apos;s coverage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Morning Shift (6AM-2PM)</span>
              <span className="font-medium">45 guards</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Evening Shift (2PM-10PM)</span>
              <span className="font-medium">52 guards</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Night Shift (10PM-6AM)</span>
              <span className="font-medium">38 guards</span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Coverage</span>
                <span className="font-bold text-primary">135 guards</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
