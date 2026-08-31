
import Link from 'next/link'
import { LiveLoginActivityCard } from '@/components/superadmin/live-login-activity-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, LogIn, UserPlus, AlertTriangle, Clock } from 'lucide-react'
import { CronStatusCard } from '@/components/superadmin/cron-status-card'
import { getActivityErrorCounts, getAttendanceActivity, getLoginActivity } from '@/lib/auth-activity'


interface UserChangeActivity {
  id: string
  type: 'user_added' | 'user_edited' | 'attendance_error' | 'permission_changed'
  actor: string
  subject: string
  timestamp: string
  description: string
}

const userChangeActivities: UserChangeActivity[] = [
  { 
    id: '1', 
    type: 'user_added', 
    actor: 'Super Admin', 
    subject: 'Ahmad Rif\'an', 
    timestamp: '2025-05-07 14:15:30', 
    description: 'New user added to HR Department' 
  },
  { 
    id: '2', 
    type: 'attendance_error', 
    actor: 'System', 
    subject: 'Attendance Check-in Failed', 
    timestamp: '2025-05-07 13:30:00', 
    description: '5 employees failed to check in today' 
  },
  { 
    id: '3', 
    type: 'user_edited', 
    actor: 'Admin User', 
    subject: 'Budi Santoso', 
    timestamp: '2025-05-07 12:45:15', 
    description: 'Position changed from Staff to Senior Staff' 
  },
  { 
    id: '4', 
    type: 'permission_changed', 
    actor: 'Super Admin', 
    subject: 'Finance Team', 
    timestamp: '2025-05-07 11:20:00', 
    description: 'Added report access permission' 
  },
  { 
    id: '5', 
    type: 'attendance_error', 
    actor: 'System', 
    subject: 'Overtime Record Error', 
    timestamp: '2025-05-07 10:00:00', 
    description: 'Invalid overtime entries detected' 
  },
  { 
    id: '6', 
    type: 'user_added', 
    actor: 'Super Admin', 
    subject: 'Siti Nurhaliza', 
    timestamp: '2025-05-06 16:30:00', 
    description: 'New user added to Marketing Department' 
  },
  { 
    id: '7', 
    type: 'user_edited', 
    actor: 'Admin User', 
    subject: 'Rinto Harahap', 
    timestamp: '2025-05-06 15:15:00', 
    description: 'Department changed from Operations to Finance' 
  },
]

const getActivityBadgeColor = (type: string) => {
  switch (type) {
    case 'user_added':
      return 'bg-success/10 text-success'
    case 'user_edited':
      return 'bg-primary/10 text-primary'
    case 'attendance_error':
      return 'bg-destructive/10 text-destructive'
    case 'permission_changed':
      return 'bg-warning/10 text-warning'
    default:
      return 'bg-muted/10 text-muted-foreground'
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_added':
      return { icon: UserPlus, color: 'text-success' }
    case 'user_edited':
      return { icon: UserPlus, color: 'text-primary' }
    case 'attendance_error':
      return { icon: AlertTriangle, color: 'text-destructive' }
    case 'permission_changed':
      return { icon: AlertTriangle, color: 'text-warning' }
    default:
      return { icon: Clock, color: 'text-muted-foreground' }
  }
}

export default async function DashboardPage() {
  const [loginActivities, attendanceActivities, errorCounts] = await Promise.all([
    getLoginActivity(20),
    getAttendanceActivity(20),
    getActivityErrorCounts(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <LayoutDashboard className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor system activity and user operations</p>
        </div>
      </div>

      {/* Error Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Login Errors</p>
                <p className="text-2xl font-bold text-foreground mt-1">{errorCounts.login}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <LogIn className="size-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Errors</p>
                <p className="text-2xl font-bold text-foreground mt-1">{errorCounts.attendance}</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <AlertTriangle className="size-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Cron Status Monitor */}
      <CronStatusCard />

      {/* Activity monitoring */}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Login Activity */}
        <LiveLoginActivityCard initialActivities={loginActivities} />

        {/* User Attendance Activity */}
        <Card className="border border-border bg-card flex flex-col h-full min-h-[500px]">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                <div>
                  <CardTitle>User Attendance</CardTitle>
                  <CardDescription>Recent attendance errors</CardDescription>
                </div>
              </div>
              <Button asChild variant="outline" size="sm"><Link href="/superadmin/activity/attendance">View all</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {attendanceActivities.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-1 size-4 shrink-0 text-destructive" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground">{activity.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{activity.result.replace('FAILED_', '').replaceAll('_', ' ')} · {activity.action.replace('ATTENDANCE_', '')}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {attendanceActivities.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No attendance errors recorded.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Change Activity */}
        <Card className="border border-border bg-card flex flex-col h-full min-h-[500px]">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                <div>
                  <CardTitle>User Change Activity</CardTitle>
                  <CardDescription>Recent changes to users and system events</CardDescription>
                </div>
              </div>
              <Button asChild variant="outline" size="sm"><Link href="/superadmin/activity/change">View all</Link></Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {userChangeActivities.filter((activity) => activity.type !== 'attendance_error').slice(0, 20).map((activity) => {
                  const { icon: Icon, color } = getActivityIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="rounded-lg border border-border bg-background p-4 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="rounded-lg bg-muted p-2 flex-shrink-0">
                          <Icon className={`size-4 ${color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-foreground">{activity.subject}</p>
                            <Badge
                              className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                              variant="outline"
                            >
                              {activity.type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.actor} • {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
