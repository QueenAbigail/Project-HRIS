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
        
        // Step 1: Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('[v0] SESSION CHECK:', {
          sessionExists: !!session,
          sessionUserId: session?.user?.id,
          sessionUserEmail: session?.user?.email,
          sessionError: sessionError?.message
        })

        if (sessionError || !session?.user?.email) {
          console.log('[v0] No valid session found, signing out')
          await supabase.auth.signOut()
          router.push('/')
          return
        }

        // Step 2: Attempt to fetch user profile with ALL columns for debugging
        console.log('[v0] FETCHING PROFILE - Query params:', {
          table: 'users',
          userId: session.user.id,
          idType: typeof session.user.id
        })

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*') // Fetch ALL columns to debug
          .eq('id', session.user.id)
          .single()

        console.log('[v0] PROFILE QUERY RESULT:', {
          profileExists: !!profile,
          profileError: profileError?.message,
          profileErrorCode: profileError?.code,
          profileData: profile ? {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
            position: profile.position,
            allColumns: Object.keys(profile)
          } : null
        })

        // Step 3: Debugging - Temporarily DISABLE redirect if session exists
        // This allows you to see what's happening in the console
        if (profileError || !profile) {
          console.warn('[v0] PROFILE QUERY FAILED - Debugging Mode (NOT redirecting yet)', {
            reason: profileError ? 'Query error' : 'No profile returned',
            error: profileError,
            sessionUserId: session.user.id,
            suggestion: 'Check RLS policies or if user ID matches users table'
          })

          // TEMPORARY: Comment out the redirect to debug
          // Uncomment when debugging is done:
          // await supabase.auth.signOut()
          // router.push('/')
          
          // For now, use a dummy user to see the dashboard
          setUser({
            name: `[DEBUG] ${session.user.email}`,
            email: session.user.email,
            position: null,
            role: 'DEBUG',
          })
          setSystemSettings({
            appName: 'SecureGuard [DEBUG MODE]',
            appDescription: 'HR Administration',
          })
          setIsLoading(false)
          return
        }

        // Step 4: Profile found - use it
        console.log('[v0] PROFILE FOUND - Setting user data')
        
        const fullName = profile.firstName || profile.lastName 
          ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
          : session.user.email.split('@')[0]

        setUser({
          name: fullName,
          email: session.user.email,
          position: profile.position || null,
          role: profile.role,
        })

        setSystemSettings({
          appName: 'SecureGuard',
          appDescription: 'HR Administration',
        })

        console.log('[v0] USER DATA SET SUCCESSFULLY:', {
          name: fullName,
          email: session.user.email,
          role: profile.role
        })

      } catch (error) {
        console.error('[v0] CRITICAL ERROR in loadUserData:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null
        })
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
