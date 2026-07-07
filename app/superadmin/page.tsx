'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LayoutDashboard, LogIn, UserPlus, AlertTriangle, Clock, AlertCircle, Eye, Search, X } from 'lucide-react'
import { CronStatusCard } from '@/components/superadmin/cron-status-card'

interface LoginActivity {
  id: string
  email: string
  timestamp: string
  ipAddress: string
  device: string
}

interface UserChangeActivity {
  id: string
  type: 'user_added' | 'user_edited' | 'attendance_error' | 'permission_changed'
  actor: string
  subject: string
  timestamp: string
  description: string
}

// Dummy data
const loginActivities: LoginActivity[] = [
  { id: '1', email: 'john.doe@example.com', timestamp: '2025-05-07 14:32:15', ipAddress: '192.168.1.100', device: 'Chrome - Windows' },
  { id: '2', email: 'jane.smith@example.com', timestamp: '2025-05-07 13:45:22', ipAddress: '192.168.1.101', device: 'Safari - macOS' },
  { id: '3', email: 'admin@example.com', timestamp: '2025-05-07 12:15:00', ipAddress: '192.168.1.102', device: 'Firefox - Ubuntu' },
  { id: '4', email: 'hr.manager@example.com', timestamp: '2025-05-07 10:30:45', ipAddress: '192.168.1.103', device: 'Chrome - Windows' },
  { id: '5', email: 'finance.team@example.com', timestamp: '2025-05-07 09:12:30', ipAddress: '192.168.1.104', device: 'Safari - iOS' },
  { id: '6', email: 'support@example.com', timestamp: '2025-05-06 16:45:20', ipAddress: '192.168.1.105', device: 'Chrome - Android' },
  { id: '7', email: 'ops@example.com', timestamp: '2025-05-06 15:20:10', ipAddress: '192.168.1.106', device: 'Edge - Windows' },
  { id: '8', email: 'marketing@example.com', timestamp: '2025-05-06 14:05:00', ipAddress: '192.168.1.107', device: 'Firefox - macOS' },
]

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

export default function DashboardPage() {
  const [filterDate, setFilterDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  // Error counts
  const errorCounts = {
    login: 12,
    attendance: 28,
    patrol: 5,
    data: 8,
  }

  // Helper function to check if timestamp is within filter range
  const isWithinTimeRange = (timestamp: string) => {
    if (timeFilter === 'all') return true
    const date = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (timeFilter) {
      case 'today':
        return date >= today
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return date >= weekAgo
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return date >= monthAgo
      default:
        return true
    }
  }

  // Filtered activities based on date, search, and time filter
  const filteredLoginActivities = useMemo(() => {
    return loginActivities.filter((activity) => {
      const matchesDate = filterDate ? activity.timestamp.startsWith(filterDate) : true
      const matchesSearch = searchQuery 
        ? activity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.ipAddress.includes(searchQuery) ||
          activity.device.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      const matchesTime = isWithinTimeRange(activity.timestamp)
      return matchesDate && matchesSearch && matchesTime
    })
  }, [filterDate, searchQuery, timeFilter])

  const filteredUserChangeActivities = useMemo(() => {
    return userChangeActivities.filter((activity) => {
      const matchesDate = filterDate ? activity.timestamp.startsWith(filterDate) : true
      const matchesSearch = searchQuery 
        ? activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true
      const matchesTime = isWithinTimeRange(activity.timestamp)
      return matchesDate && matchesSearch && matchesTime
    })
  }, [filterDate, searchQuery, timeFilter])

  const clearFilters = () => {
    setFilterDate('')
    setSearchQuery('')
    setTimeFilter('all')
  }

  const hasActiveFilters = filterDate || searchQuery || timeFilter !== 'all'

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card className="border border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patrol Errors</p>
                <p className="text-2xl font-bold text-foreground mt-1">{errorCounts.patrol}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Eye className="size-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Errors</p>
                <p className="text-2xl font-bold text-foreground mt-1">{errorCounts.data}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <AlertCircle className="size-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cron Status Monitor */}
      <CronStatusCard />

      {/* Filter Section */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, IP, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Time Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Time Range</label>
                <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Specific Date</label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>

            {/* Active Filters & Clear */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X 
                      className="size-3 cursor-pointer hover:text-destructive" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {timeFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Time: {timeFilter}
                    <X 
                      className="size-3 cursor-pointer hover:text-destructive" 
                      onClick={() => setTimeFilter('all')}
                    />
                  </Badge>
                )}
                {filterDate && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {filterDate}
                    <X 
                      className="size-3 cursor-pointer hover:text-destructive" 
                      onClick={() => setFilterDate('')}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredLoginActivities.length} login activities and {filteredUserChangeActivities.length} change activities
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Login Activity */}
        <Card className="border border-border bg-card flex flex-col h-full min-h-[500px]">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <LogIn className="size-5 text-primary" />
              <div>
                <CardTitle>User Login Activity</CardTitle>
                <CardDescription>Recent login records from system users</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {filteredLoginActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-lg border border-border bg-background p-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{activity.email}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.ipAddress}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {activity.device}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Change Activity */}
        <Card className="border border-border bg-card flex flex-col h-full min-h-[500px]">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <UserPlus className="size-5 text-primary" />
              <div>
                <CardTitle>User Change Activity</CardTitle>
                <CardDescription>Recent changes to users and system events</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-6">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {filteredUserChangeActivities.map((activity) => {
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
