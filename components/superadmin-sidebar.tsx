"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Shield,
  Bell,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Info,
  Users,
  Layers,
  Database,
  CalendarDays,
  Smartphone,
  MapPin,
  Mail,
  Settings,
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
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'

import { fetchSystemSettings } from '@/lib/client-system'

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

const adminNavItems = [
  {
    title: 'Dashboard',
    url: '/superadmin',
    icon: LayoutDashboard,
  },
  {
    title: 'Information',
    url: '/superadmin/information',
    icon: Info,
  },
  {
    title: 'Client',
    url: '/superadmin/client',
    icon: Users,
  },
  {
    title: 'Structure',
    url: '/superadmin/structure',
    icon: Layers,
  },
  {
    title: 'Data',
    url: '/superadmin/data',
    icon: Database,
  },
  {
    title: 'Schedules',
    url: '/superadmin/schedules',
    icon: CalendarDays,
  },
  {
    title: 'Device Management',
    url: '/superadmin/devices',
    icon: Smartphone,
  },
  {
    title: 'GPS Locations',
    url: '/superadmin/gps-locations',
    icon: MapPin,
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

export function SuperadminSidebar({ user, systemSettings: propSystemSettings }: Props) {
  const pathname = usePathname()
  const [localSystemSettings, setLocalSystemSettings] = React.useState<SystemSettings>({ appName: 'SecureGuard', appDescription: 'HR Administration' })
  const [loading, setLoading] = React.useState(!propSystemSettings)

  const systemSettings = propSystemSettings || localSystemSettings

  React.useEffect(() => {
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

  const displayName = user?.name ?? user?.email ?? 'Unknown User'
  const displayPosition = user?.position ?? 'Staff'
  const initials = user?.name ? (user.name[0]?.toUpperCase() + (user.name[1]?.toUpperCase() || '')) : 'U?'
  const userRole = user?.role || null

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
          <SidebarGroupLabel>Admin Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
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
