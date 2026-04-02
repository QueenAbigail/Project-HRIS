"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AuthCheck } from "@/components/auth-check"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { FloatingSidebarToggle } from "@/components/floating-sidebar-toggle"

const pathNames: Record<string, string> = {
  '/': 'Overview',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/payroll': 'Payroll',
  '/leave': 'Leave Management',
  '/shifts': 'Shift Schedule',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentPage = pathNames[pathname] || 'Dashboard'

  return (
    <AuthCheck>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname !== '/' && (
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
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
          <FloatingSidebarToggle />
        </SidebarInset>
      </SidebarProvider>
    </AuthCheck>
  )
}
