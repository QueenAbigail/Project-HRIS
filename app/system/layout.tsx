import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { UnauthorizedAccess } from "@/components/superadmin/unauthorized-access"
import { SystemBreadcrumb } from "@/components/system/system-breadcrumb"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSystemSettings } from "@/lib/system"
import Link from "next/link"
import { LogOut } from "lucide-react"

interface User {
  name: string | null
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
  params?: Promise<{
    [key: string]: string | string[]
  }>
}

export default async function SystemLayout({ children, params }: LayoutProps) {
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
      role: true 
    }
  }) as User | null

  const systemSettings = await getSystemSettings()

  return (
    <>
      <UnauthorizedAccess userRole={user?.role || null} />
      <SidebarProvider>
        <AppSidebar user={user} systemSettings={systemSettings || { appName: 'SecureGuard', appDescription: 'HR Administration' }} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/50 backdrop-blur-sm px-4">
            <div className="flex items-center gap-2">
              <SystemBreadcrumb />
            </div>
            <Link href="/dashboard">
              <Button 
                size="sm" 
                className="gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium transition-all duration-200 active:scale-95"
              >
                <LogOut className="size-4" />
                Back to Dashboard
              </Button>
            </Link>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
