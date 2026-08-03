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
    '/dashboard': 'Dashboard',
    '/dashboard/overview': 'Overview',
    '/dashboard/employees': 'Employees',
    '/dashboard/attendance': 'Attendance',
    '/dashboard/patrol': 'Patrol Monitoring',
    '/dashboard/leave': 'Leave Management',
    '/dashboard/shifts': 'Shift Schedule',
    '/payroll': 'Payroll',
    '/payroll/management': 'Management',
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

  // Build breadcrumb items based on the current path
  const buildBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    // Always add Dashboard as the first item
    breadcrumbs.push({
      href: '/dashboard',
      label: 'Dashboard',
      isCurrent: pathname === '/dashboard'
    })

    // Build path segments for all parents and current
    let currentPath = ''
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`
      
      // Skip if it's dashboard (already added)
      if (currentPath === '/dashboard') continue

      const label = pathNames[currentPath]
      if (label) {
        breadcrumbs.push({
          href: currentPath,
          label: label,
          isCurrent: currentPath === pathname
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = buildBreadcrumbs()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={item.href} className="flex items-center gap-2">
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className="hidden md:block">
              {item.isCurrent ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
