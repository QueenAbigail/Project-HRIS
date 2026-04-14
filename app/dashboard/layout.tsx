"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

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

// 1. UPDATE: Tambahin /dashboard di semua key objek ini
const pathNames: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/employees': 'Employees',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/payroll': 'Payroll',
  '/dashboard/leave': 'Leave Management',
  '/dashboard/shifts': 'Shift Schedule',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // 2. UPDATE: Default ke Dashboard kalau nggak ada yang cocok
  const currentPage = pathNames[pathname] || 'Dashboard'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  {/* 3. UPDATE: Link Home balikin ke /dashboard */}
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {/* 4. UPDATE: Cek kalau bukan di home dashboard */}
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
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
        <FloatingSidebarToggle />
      </SidebarInset>
    </SidebarProvider>
  )
}