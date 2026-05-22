"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import {
  LayoutDashboard,
  Users,
  Clock,
  Wallet,
  CalendarDays,
  FileBarChart,
  Settings,
  Shield,
  Bell,
  LogOut,
  ChevronDown,
  MapPin,
  ChevronLeft,
  Monitor,
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
          width={32} 
          height={32} 
          className="rounded-lg object-cover"
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
    badge: 12,
  },
  {
    title: 'Patrol Monitoring',
    url: '/dashboard/patrol',
    icon: MapPin,
  },
  {
    title: 'Payroll',
    url: '/dashboard/payroll',
    icon: Wallet,
  },
  {
    title: 'Leave Management',
    url: '/dashboard/leave',
    icon: CalendarDays,
    badge: 5,
  },
]

export function AppSidebar({ user, systemSettings: propSystemSettings }: Props) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [localSystemSettings, setLocalSystemSettings] = useState<SystemSettings>({ appName: 'SecureGuard', appDescription: 'HR Administration' })
  const [loading, setLoading] = useState(!propSystemSettings)

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
      setLoading(false)
    }
  }, [propSystemSettings])

  if (loading) {
    return <Sidebar variant="inset" />
  }

  const secondaryNavItems = [
    {
      title: 'Reports',
      url: '/dashboard/reports',
      icon: FileBarChart,
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings,
    },
  ]

  const displayName = user?.name ?? user?.email ?? 'Unknown User'
  const displayPosition = user?.position ?? 'Staff'
  const initials = user?.name ? (user.name[0]?.toUpperCase() + (user.name[1]?.toUpperCase() || '')) : 'U?'

  return (
    <Sidebar variant="inset" collapsible="icon" className="overflow-hidden">
      <SidebarHeader className="border-b border-sidebar-border overflow-hidden">
        <SidebarMenu className="flex items-center justify-between gap-2">
          <SidebarMenuItem className="flex-1 min-w-0">
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="min-w-0">
                <LogoIcon src={systemSettings.logoUrl || '/icon.svg'} alt={systemSettings.appName} className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground flex-shrink-0" />
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">{systemSettings.appName}</span>
                  <span className="truncate text-xs text-muted-foreground">{systemSettings.appDescription}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex-shrink-0">
            <SidebarMenuButton 
              onClick={toggleSidebar} 
              className="size-9"
              title={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronLeft className={`size-4 transition-transform duration-300 ${state === 'collapsed' ? 'rotate-180' : ''}`} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="[&>[data-radix-scroll-area-viewport]]:overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent className="overflow-x-hidden">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center min-w-0 gap-2">
                      <item.icon className="size-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
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
                  <Bell className="mr-2 size-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {mounted && (
                  <DropdownMenuItem 
                    onClick={() => {
                      const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
                      setTheme(nextTheme)
                    }}
                  >
                    {theme === 'light' ? (
                      <>
                        {/* Sun icon for light mode */}
                        <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light
                      </>
                    ) : theme === 'dark' ? (
                      <>
                        {/* Moon icon for dark mode */}
                        <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark
                      </>
                    ) : (
                      <>
                        <Monitor className="mr-2 size-4" />
                        System {resolvedTheme && `(${resolvedTheme.charAt(0).toUpperCase() + resolvedTheme.slice(1)})`}
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={async () => {
                    const { logout } = await import('@/lib/auth')
                    await logout()
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

