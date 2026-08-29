'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const pathNames: Record<string, string> = {
  '/superadmin': 'Admin Dashboard',
  '/superadmin/information': 'Information',
  '/superadmin/client': 'Client',
  '/superadmin/structure': 'Structure',
  '/superadmin/data': 'Data',
  '/superadmin/schedules': 'Schedules',
  '/superadmin/devices': 'Device Management',
  '/superadmin/gps-locations': 'GPS Locations',
  '/superadmin/print-qr-code': 'Print QR Code',
  '/superadmin/email-templates': 'Email Templates',
  '/superadmin/activity/login': 'Login Activity',
  '/superadmin/activity/attendance': 'User Attendance',
  '/superadmin/activity/change': 'Change Activity',
  '/superadmin/settings': 'Settings',
}

export function SuperadminBreadcrumb() {
  const pathname = usePathname()
  const currentPage = pathNames[pathname] || 'Admin Dashboard'
  
  // If on root superadmin page, show just the page name
  if (pathname === '/superadmin') {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // For sub-pages, show Admin Dashboard > Current Page
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/superadmin">
            Admin Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
