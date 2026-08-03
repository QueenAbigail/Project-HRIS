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

export function SystemBreadcrumb() {
  const pathname = usePathname()

  const pathNames: Record<string, string> = {
    '/system': 'System',
    '/system/map-sites': 'Map Site',
    '/system/broadcast': 'Broadcast',
    '/system/reports': 'Reports',
    '/system/settings': 'Settings',
  }

  const currentPage = pathNames[pathname] || 'System'
  const showSeparator = pathname !== '/system'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/system">
            System
          </BreadcrumbLink>
        </BreadcrumbItem>
        {showSeparator && (
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
