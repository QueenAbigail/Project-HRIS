import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your HR system preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Update your company details</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="company">Company Name</FieldLabel>
                <Input id="company" defaultValue="SecureGuard Security Services" />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Contact Email</FieldLabel>
                <Input id="email" type="email" defaultValue="hr@secureguard.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input id="phone" defaultValue="+1 (555) 123-4567" />
              </Field>
            </FieldGroup>
            <div className="mt-4">
              <Button>Save Changes</Button>
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
                <Label>Attendance Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when employees are late or absent</p>
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
