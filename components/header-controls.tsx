"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

interface HeaderControlsProps {
  userRole: string | null
}

export function HeaderControls({ userRole }: HeaderControlsProps) {
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  if (!isSuperAdmin) {
    return null
  }

  return (
    <div className="ml-auto">
      <Link href="/superadmin">
        <Button variant="outline" size="sm" className="gap-2">
          <ShieldAlert className="size-4" />
          Superadmin
        </Button>
      </Link>
    </div>
  )
}
