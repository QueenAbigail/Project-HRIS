'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Bell, Settings, Shield, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal notification preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Superadmin Settings Link */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">System Administration</h3>
                  <p className="text-sm text-muted-foreground">
                    Access advanced settings, attendance rules, and system configuration
                  </p>
                </div>
              </div>
              <Link href="/superadmin/settings">
                <Button variant="outline" className="gap-2">
                  <Settings className="size-4" />
                  Superadmin Settings
                  <ExternalLink className="size-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Personal Notification Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure your personal notification settings</CardDescription>
              </div>
            </div>
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
            <div className="pt-4">
              <Button>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>

        {/* System Preferences (Read-only for non-superadmin) */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>View system behavior settings (managed by administrators)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-muted-foreground">Auto-approve Sick Leave</Label>
                <p className="text-sm text-muted-foreground">Automatically approve single-day sick leave</p>
              </div>
              <Badge variant="outline">Disabled</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-muted-foreground">Overtime Alerts</Label>
                <p className="text-sm text-muted-foreground">Alert when overtime exceeds 10 hours/week</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
