export const dynamic = 'force-dynamic'

import { AppSidebar } from "@/components/app-sidebar"
import { HeaderControls } from "@/components/header-controls"
import { WelcomeToast } from "@/components/dashboard/welcome-toast"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LoadingProvider } from "@/lib/loading-context"
import { getCurrentUser, getSystemSettings } from "@/lib/system"
import { redirect } from "next/navigation"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"

interface SystemSettings {
  appName: string
  appDescription: string
  logoUrl?: string | null
}

export interface LayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  const systemSettings = await getSystemSettings()

  return (
    <LoadingProvider>
      <SidebarProvider suppressHydrationWarning>
        <WelcomeToast userName={user?.name} />
        <AppSidebar user={user} systemSettings={systemSettings || { appName: 'SecureGuard', appDescription: 'HR Administration' }} />
        <SidebarInset className="flex min-w-0 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/50 backdrop-blur-sm px-4">
            <MobileHeader />
            <div className="flex items-center gap-2">
              <DashboardBreadcrumb />
            </div>
            <HeaderControls userRole={user?.role || null} />
          </header>
          <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LoadingProvider>
  )
}
