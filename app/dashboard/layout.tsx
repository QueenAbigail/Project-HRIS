export const dynamic = 'force-dynamic'

import { AppSidebar } from "@/components/app-sidebar"
import { HeaderControls } from "@/components/header-controls"
import { WelcomeToast } from "@/components/dashboard/welcome-toast"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LoadingProvider } from "@/lib/loading-context"
import { createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSystemSettings } from "@/lib/system"
import { redirect } from "next/navigation"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"

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
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser?.email) {
      redirect('/')
    }

    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { 
        name: true, 
        position: true, 
        role: true,
        email: true
      }
    })

    if (!user) {
      redirect('/')
    }

    const systemSettings = await getSystemSettings()

    return (
      <LoadingProvider>
        <SidebarProvider suppressHydrationWarning>
          <WelcomeToast userName={user?.name} />
          <AppSidebar user={{ name: user.name, email: user.email, position: user.position, role: user.role }} systemSettings={systemSettings || { appName: 'SecureGuard', appDescription: 'HR Administration' }} />
          <SidebarInset className="flex flex-col">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/50 backdrop-blur-sm px-4">
              <MobileHeader />
              <div className="flex items-center gap-2">
                <DashboardBreadcrumb />
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
  } catch (error) {
    console.error('Dashboard layout error:', error instanceof Error ? error.message : error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Layout Error</h1>
          <p className="text-gray-600 mb-2">An error occurred loading the dashboard.</p>
          <p className="text-sm text-gray-500 mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <a href="/" className="text-blue-600 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    )
  }
}
