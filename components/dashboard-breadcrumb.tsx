'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function DashboardBreadcrumb() {
  const pathname = usePathname()

  const pathNames: Record<string, string> = {
    '/dashboard': 'Overview',
    '/dashboard/employees': 'Employees',
    '/dashboard/attendance': 'Attendance',
    '/dashboard/patrol': 'Patrol Monitoring',
    '/dashboard/leave': 'Leave Management',
    '/dashboard/shifts': 'Shift Schedule',
    '/dashboard/map-sites': 'Map Site',
    '/dashboard/reports': 'Reports',
    '/dashboard/settings': 'Settings',
    '/payroll': 'Payroll',
    '/payroll/management': 'Payroll Management',
    '/payroll/salary': 'Salary',
    '/payroll/overtime': 'Overtime',
    '/payroll/deduction': 'Deduction',
    '/payroll/manage-overtime': 'Manage Overtime',
    '/payroll/monthly-recap': 'Monthly Recap',
    '/superadmin/devices': 'Device Management',
    '/superadmin/client': 'Client Management',
    '/superadmin/data': 'Data Management',
    '/superadmin/settings': 'Settings',
    '/superadmin/structure': 'Structure',
    '/superadmin/schedules': 'Schedules',
    '/superadmin/email-templates': 'Email Templates',
    '/superadmin/gps-locations': 'GPS Locations',
    '/superadmin/information': 'Information',
    '/superadmin/print-qr-code': 'Print QR Code',
  }

  const currentPage = pathNames[pathname] || 'Dashboard'
  const isDashboard = pathname === '/dashboard'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        {!isDashboard && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
