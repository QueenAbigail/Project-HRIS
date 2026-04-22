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
  CalendarClock,
  FileBarChart,
  Settings,
  ShieldAlert,
  Shield,
  Bell,
  LogOut,
  ChevronDown,
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
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  {
    title: 'Shift Schedule',
    url: '/dashboard/shifts',
    icon: CalendarClock,
  },
]

export function AppSidebar({ user, systemSettings: propSystemSettings }: Props) {
  const pathname = usePathname()
  const [localSystemSettings, setLocalSystemSettings] = useState<SystemSettings>({ appName: 'SecureGuard', appDescription: 'HR Administration' })
  const [loading, setLoading] = useState(!propSystemSettings)

  const systemSettings = propSystemSettings || localSystemSettings
  const userRole = user?.role || null

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

  if (userRole === 'SUPER_ADMIN') {
    secondaryNavItems.push({
      title: 'Superadmin',
      url: '/dashboard/superadmin',
      icon: ShieldAlert,
    })
  }

  const displayName = user?.name ?? user?.email ?? 'Unknown User'
  const displayPosition = user?.position ?? 'Staff'
  const initials = user?.name ? (user.name[0]?.toUpperCase() + (user.name[1]?.toUpperCase() || '')) : 'U?'

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <LogoIcon src={systemSettings.logoUrl || '/icon.svg'} alt={systemSettings.appName} className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{systemSettings.appName}</span>
                  <span className="truncate text-xs text-muted-foreground">{systemSettings.appDescription}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
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
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu className="flex flex-row justify-between">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8">
                    <AvatarImage src="/placeholder-user.jpg" alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{displayPosition}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
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
          <SidebarMenuItem className="ml-auto">
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

