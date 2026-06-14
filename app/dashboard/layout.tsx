'use client'

export const dynamic = 'force-dynamic'

import { AppSidebar } from "@/components/app-sidebar"
import { HeaderControls } from "@/components/header-controls"
import { WelcomeToast } from "@/components/dashboard/welcome-toast"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LoadingProvider } from "@/lib/loading-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface User {
  name: string | null
  email: string
  position: string | null
  role: string
}

interface SystemSettings {
  appName: string
  appDescription: string
  logoUrl?: string | null
}

export interface LayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: LayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session?.user?.email) {
          await supabase.auth.signOut()
          router.push('/')
          return
        }

        // Fetch user data from the users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('name, role, position')
          .eq('id', session.user.id)
          .single()

        // Strict check: if profileError or !profile, sign out and redirect
        if (profileError || !profile) {
          await supabase.auth.signOut()
          router.push('/')
          return
        }

        setUser({
          name: profile.name || session.user.email.split('@')[0],
          email: session.user.email,
          position: profile.position || null,
          role: profile.role,
        })

        setSystemSettings({
          appName: 'SecureGuard',
          appDescription: 'HR Administration',
        })
      } catch (error) {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const pathNames: Record<string, string> = {
    '/dashboard': 'Overview',
    '/dashboard/employees': 'Employees',
    '/dashboard/attendance': 'Attendance',
    '/dashboard/patrol': 'Patrol Monitoring',
    '/payroll': 'Payroll',
    '/dashboard/leave': 'Leave Management',
    '/dashboard/shifts': 'Shift Schedule',
    '/dashboard/reports': 'Reports',
    '/dashboard/settings': 'Settings',
    '/superadmin/devices': 'Device Management',
  }

  const pathname = '/dashboard'
  const currentPage = pathNames[pathname] || 'Dashboard'

  if (isLoading) {
    return (
      <LoadingProvider>
        <SidebarProvider>
          <SidebarInset>
            <main className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center">
              <div className="text-center">Loading...</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </LoadingProvider>
    )
  }

  return (
    <LoadingProvider>
      <SidebarProvider suppressHydrationWarning>
        <WelcomeToast userName={user?.name} />
        <AppSidebar user={user} systemSettings={systemSettings || { appName: 'SecureGuard', appDescription: 'HR Administration' }} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/50 backdrop-blur-sm px-4">
            <MobileHeader />
            <div className="flex items-center gap-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname !== '/dashboard' && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <HeaderControls userRole={user?.role || null} />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LoadingProvider>
  )
}
