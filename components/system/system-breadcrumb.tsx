'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { systemTools } from '@/lib/system-tools'

const pathNames: Record<string, string> = {
  '/system/map-sites': 'Map Site',
  '/system/broadcast': 'Broadcast',
  '/system/reports': 'Reports',
  '/system/tools': 'Tools',
  '/system/settings': 'Settings',
  ...Object.fromEntries(systemTools.map((tool) => [tool.href, tool.title])),
}

export function SystemBreadcrumb() {
  const pathname = usePathname()

  const trail = pathname
    .split('/')
    .filter(Boolean)
    .map((_, i, parts) => '/' + parts.slice(0, i + 1).join('/'))
    .filter((href) => href !== '/system' && pathNames[href])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          {trail.length === 0 ? (
            <BreadcrumbPage>System</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href="/system">System</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {trail.map((href, i) => (
          <Fragment key={href}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              {i === trail.length - 1 ? (
                <BreadcrumbPage>{pathNames[href]}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={href}>{pathNames[href]}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
