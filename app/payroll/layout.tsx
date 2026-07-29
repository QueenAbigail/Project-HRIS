import { AppSidebar } from "@/components/app-sidebar"
import { HeaderControls } from "@/components/header-controls"
import { MobileHeader } from "@/components/mobile-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LoadingProvider } from "@/lib/loading-context"
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
import { getUserData, type User } from "@/lib/get-user-data"
import { getSystemSettings } from "@/lib/system"

interface SystemSettings {
  appName: string
  appDescription: string
  logoUrl?: string | null
}

export interface LayoutProps {
  children: React.ReactNode
}

export default async function PayrollLayout({ children }: LayoutProps) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser?.email) {
    redirect('/')
  }

  let user: User | null = null
  let systemSettings: SystemSettings | null = null

  try {
    user = await getUserData(authUser.email)
  } catch (error) {
    console.error('[v0] Error fetching user from database:', error)
    user = null
  }

  try {
    systemSettings = await getSystemSettings()
  } catch (error) {
    console.error('[v0] Error fetching system settings:', error)
    systemSettings = null
  }

  return (
    <LoadingProvider>
      <SidebarProvider>
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
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Payroll</BreadcrumbPage>
                  </BreadcrumbItem>
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
