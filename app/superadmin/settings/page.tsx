'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle, Bell, Settings } from 'lucide-react'
import { shifts } from '@/lib/constants'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings, notifications, and attendance rules
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Late Check-In Settings */}
        <Card className="bg-card border-border ring-1 ring-warning/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="size-5 text-warning" />
                </div>
                <div>
                  <CardTitle>Late Check-In Rules</CardTitle>
                  <CardDescription>Configure automatic late detection settings</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Late Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically flag employees who check in after their scheduled time
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />

            {/* Grace Period Settings per Shift */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Grace Period by Shift</Label>
                <p className="text-sm text-muted-foreground">
                  Minutes allowed after scheduled start time before marking as late
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {shifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                    <div>
                      <p className="text-sm font-medium">{shift.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        className="w-16 text-center"
                        defaultValue={shift.gracePeriodMinutes}
                        min={0}
                        max={60}
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator />

            {/* Late Severity Thresholds */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Late Severity Thresholds</Label>
                <p className="text-sm text-muted-foreground">
                  Define when late check-ins are classified as minor, moderate, or severe
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      Minor
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Up to</span>
                    <Input type="number" className="w-16 text-center" defaultValue={15} />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Moderate
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Up to</span>
                    <Input type="number" className="w-16 text-center" defaultValue={30} />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      Severe
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Over</span>
                    <Input type="number" className="w-16 text-center" defaultValue={30} disabled />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
              </div>
            </div>
            <Separator />

            {/* Auto Actions */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Automatic Actions</Label>
                <p className="text-sm text-muted-foreground">
                  Actions triggered when employees are marked late
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="size-4 text-warning" />
                    <div>
                      <p className="text-sm font-medium">Notify Supervisor</p>
                      <p className="text-xs text-muted-foreground">Send alert to location supervisor</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Bell className="size-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Notify HR Department</p>
                      <p className="text-xs text-muted-foreground">Send daily late report to HR</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Settings className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Auto-deduct from Salary</p>
                      <p className="text-xs text-muted-foreground">Apply late penalty to payroll</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button>Save Late Check-In Settings</Button>
              <Button variant="outline">Reset to Defaults</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Leave Request Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when new leave requests are submitted</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Late Check-In Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when employees check in late based on schedule</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Attendance Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when employees are absent</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Payroll Reminders</Label>
                <p className="text-sm text-muted-foreground">Remind before payroll processing deadlines</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>Configure system behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve Sick Leave</Label>
                <p className="text-sm text-muted-foreground">Automatically approve single-day sick leave</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Overtime Alerts</Label>
                <p className="text-sm text-muted-foreground">Alert when overtime exceeds 10 hours/week</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
