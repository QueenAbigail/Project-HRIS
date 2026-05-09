import { AppSidebar } from "@/components/app-sidebar"
import { HeaderControls } from "@/components/header-controls"
import { WelcomeToast } from "@/components/dashboard/welcome-toast"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSystemSettings } from "@/lib/system"
import Link from "next/link"

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

export default async function DashboardLayout({ children }: LayoutProps) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user?.email) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      name: true, 
      position: true, 
      role: true 
    }
  }) as User | null

  const systemSettings = await getSystemSettings()

  const pathNames: Record<string, string> = {
    '/dashboard': 'Overview',
    '/dashboard/employees': 'Employees',
    '/dashboard/attendance': 'Attendance',
    '/dashboard/patrol': 'Patrol Monitoring',
    '/dashboard/payroll': 'Payroll',
    '/dashboard/leave': 'Leave Management',
    '/dashboard/shifts': 'Shift Schedule',
    '/dashboard/reports': 'Reports',
    '/dashboard/settings': 'Settings',
    '/superadmin/devices': 'Device Management',
  }

  const pathname = '/dashboard' // Default since server, or use headers() for real pathname if needed

  const currentPage = pathNames[pathname] || 'Dashboard'

  return (
    <SidebarProvider>
      <WelcomeToast userName={user?.name} />
      <AppSidebar user={user} systemSettings={systemSettings || { appName: 'SecureGuard', appDescription: 'HR Administration' }} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/50 backdrop-blur-sm px-4">
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
  )
}

