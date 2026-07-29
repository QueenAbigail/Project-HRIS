"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  LayoutDashboard,
  Users,
  Clock,
  Wallet,
  CalendarDays,
  FileBarChart,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  MapPin,
  ChevronLeft,
  Monitor,
  TrendingUp,
  Zap,
  DollarSign,
  Minus,
  Mail,
  Megaphone,
  Camera,
  Bell,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'

import { fetchSystemSettings, fetchUserRole } from '@/lib/client-system'

interface SystemSettings {
  appName: string
  appDescription: string
  logoUrl?: string | null
}

interface User {
  name: string | null
  email: string
  position: string | null
  role: string
}

interface Props {
  user: User | null
  systemSettings?: SystemSettings
}

function LogoIcon({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={className}>
      {src && src !== '/icon.svg' ? (
        <Image
          src={src}
          alt={alt}
          width={64}
          height={32}
          className="w-auto h-full"
        />
      ) : (
        <Shield className="size-4" />
      )}
    </div>
  )
}

const mainNavItems = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Employees',
    url: '/dashboard/employees',
    icon: Users,
  },
  {
    title: 'Attendance',
    url: '/dashboard/attendance',
    icon: Clock,
  },
  {
    title: 'Patrol Monitoring',
    url: '/dashboard/patrol',
    icon: MapPin,
  },
  {
    title: 'Payroll',
    url: '/payroll',
    icon: Wallet,
  },
  {
    title: 'Leave Management',
    url: '/dashboard/leave',
    icon: CalendarDays,
    badge: 0,
  },
]

const payrollNavItems = [
  {
    title: 'Dashboard',
    url: '/payroll',
    icon: LayoutDashboard,
  },
  {
    title: 'Payroll Management',
    url: '/payroll/management',
    icon: Wallet,
  },
  {
    title: 'Monthly Recap',
    url: '/payroll/monthly-recap',
    icon: FileBarChart,
  },
  {
    title: 'Manage Salary',
    url: '/payroll/salary',
    icon: DollarSign,
  },
  {
    title: 'Manage Overtime',
    url: '/payroll/overtime',
    icon: TrendingUp,
  },
  {
    title: 'Manage Deduction',
    url: '/payroll/deduction',
    icon: Minus,
  },
]

const adminNavItems = [
  {
    title: 'Dashboard',
    url: '/superadmin',
    icon: LayoutDashboard,
  },
  {
    title: 'Information',
    url: '/superadmin/information',
    icon: Settings,
  },
  {
    title: 'Client',
    url: '/superadmin/client',
    icon: Users,
  },
  {
    title: 'Structure',
    url: '/superadmin/structure',
    icon: FileBarChart,
  },
  {
    title: 'Data',
    url: '/superadmin/data',
    icon: FileBarChart,
  },
  {
    title: 'Schedules',
    url: '/superadmin/schedules',
    icon: CalendarDays,
  },
  {
    title: 'Device Management',
    url: '/superadmin/devices',
    icon: Bell,
  },
  {
    title: 'GPS Locations',
    url: '/superadmin/gps-locations',
    icon: MapPin,
  },
  {
    title: 'Print QR Code',
    url: '/superadmin/print-qr-code',
    icon: Zap,
  },
  {
    title: 'Email Templates',
    url: '/superadmin/email-templates',
    icon: Mail,
  },
  {
    title: 'Settings',
    url: '/superadmin/settings',
    icon: Settings,
  },
]

export function AppSidebar({ user, systemSettings: propSystemSettings }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [localSystemSettings, setLocalSystemSettings] = useState<SystemSettings>({ appName: 'SecureGuard', appDescription: 'HR Administration' })
  const [loading, setLoading] = useState(!propSystemSettings)
  const [pendingLeaveCount, setPendingLeaveCount] = useState<number>(5)

  const systemSettings = propSystemSettings || localSystemSettings
  const userRole = user?.role || null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!propSystemSettings) {
      const loadData = async () => {
        const settings = await fetchSystemSettings()
        if (settings) {
          setLocalSystemSettings(settings)
        }
        setLoading(false)
      }
      loadData()
    } else {
      setLocalSystemSettings(propSystemSettings)
      setLoading(false)
    }
  }, [propSystemSettings])

  // Refetch settings every 5 seconds to catch updates from information page
  useEffect(() => {
    if (!propSystemSettings) {
      const interval = setInterval(async () => {
        const settings = await fetchSystemSettings()
        if (settings) {
          setLocalSystemSettings(prevSettings => 
            // Only update if something changed
            JSON.stringify(prevSettings) !== JSON.stringify(settings) 
              ? settings 
              : prevSettings
          )
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [propSystemSettings])

  // Fetch pending leave request count
  useEffect(() => {
    const fetchPendingLeaveCount = async () => {
      try {
        const response = await fetch('/api/leaves/stats')
        if (response.ok) {
          const data = await response.json()
          setPendingLeaveCount(data.pending || 0)
        }
      } catch (error) {
        console.error('[v0] Failed to fetch pending leave count:', error)
      }
    }

    fetchPendingLeaveCount()
    // Refetch every 30 seconds
    const interval = setInterval(fetchPendingLeaveCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <Sidebar variant="inset" />
  }

  // Update Leave Management badge with pending count
  const mainNavItemsWithBadges = mainNavItems.map(item => 
    item.title === 'Leave Management' 
      ? { ...item, badge: pendingLeaveCount }
      : item
  )

  const secondaryNavItems = [
    {
      title: 'Map Site',
      url: '/system/map-sites',
      icon: MapPin,
    },
    {
      title: 'Broadcast',
      url: '/system/broadcast',
      icon: Megaphone,
    },
    {
      title: 'Reports',
      url: '/system/reports',
      icon: FileBarChart,
    },
    {
      title: 'Settings',
      url: '/system/settings',
      icon: Settings,
    },
  ]

  const displayName = user?.name ?? user?.email ?? 'Unknown User'
  const displayPosition = user?.position ?? 'Staff'
  const initials = user?.name ? (user.name[0]?.toUpperCase() + (user.name[1]?.toUpperCase() || '')) : 'U?'
  
  // Determine which menu to show based on the current path
  const isPayrollPage = pathname.startsWith('/payroll')
  const isAdminPage = pathname.startsWith('/superadmin')
  const isClientUser = userRole === 'CLIENT'
  
  let navItemsToShow = isClientUser 
    ? mainNavItemsWithBadges.filter(item => item.title !== 'Payroll')
    : mainNavItemsWithBadges
  let menuLabel = 'Main Menu'
  
  if (isPayrollPage) {
    navItemsToShow = payrollNavItems
    menuLabel = 'Payroll Menu'
  } else if (isAdminPage) {
    navItemsToShow = adminNavItems
    menuLabel = 'Admin Dashboard'
  }

  return (
    <Sidebar variant="inset" collapsible="icon" className="overflow-hidden">
      <SidebarHeader className="border-b border-sidebar-border px-0 overflow-visible">
        <SidebarMenu>
          <SidebarMenuItem className="w-full px-2 overflow-visible">
            <SidebarMenuButton size="lg" asChild className="flex-1 overflow-visible">
              <Link href="/dashboard" className="min-w-0 overflow-visible">
                <LogoIcon src={systemSettings.logoUrl || '/koperasi_icon.png'} alt={systemSettings.appName} className="flex h-8 items-center justify-center flex-shrink-0" />
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">{systemSettings.appName}</span>
                  <span className="truncate text-xs text-muted-foreground">{systemSettings.appDescription}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="w-full px-2">
            <SidebarMenuButton
              onClick={toggleSidebar}
              className="w-full h-9 flex items-center justify-center"
              title={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <div className={`flex items-center justify-center transition-transform duration-300 ${state === 'collapsed' ? 'rotate-180' : ''}`}>
                <ChevronLeft className="size-5" />
                <ChevronLeft className="size-5 -ml-3" />
                <ChevronLeft className="size-5 -ml-3" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="[&>[data-radix-scroll-area-viewport]]:overflow-x-hidden">
        {(isPayrollPage || isAdminPage) && (
          <>
            <SidebarGroup>
              <SidebarGroupContent className="overflow-x-hidden">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-primary hover:text-primary hover:bg-primary/10">
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <ChevronLeft className="size-4" />
                        <span>Back to Main Menu</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>{menuLabel}</SidebarGroupLabel>
          <SidebarGroupContent className="overflow-x-hidden">
            <SidebarMenu>
              {navItemsToShow.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center min-w-0 gap-2">
                      <item.icon className="size-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.badge > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs flex-shrink-0">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent className="overflow-x-hidden">
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center min-w-0 gap-2">
                      <item.icon className="size-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border overflow-hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src="/placeholder-user.jpg" alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{displayPosition}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 flex-shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
                  Access Level: {userRole ?? 'Unknown'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Camera className="mr-2 size-4" />
                  Change Photo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {mounted && (
                  <div className="px-2 py-2">
                    <div className="flex gap-1 bg-muted p-1 rounded-lg">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          theme === 'light'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Light theme"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          theme === 'system'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="System theme"
                      >
                        <Monitor className="size-4" />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Dark theme"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={async () => {
                    toast.success('Successfully logged out', {
                      description: 'You have been signed out successfully.',
                    })
                    const { logout } = await import('@/lib/auth')
                    await logout()
                    // Add delay to let the toast display before redirecting
                    setTimeout(() => {
                      router.push('/')
                    }, 1000)
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

