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
        <Button 
          size="sm" 
          className="gap-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-semibold shadow-md transition-all duration-200 active:scale-95"
        >
          <ShieldAlert className="size-4" />
          Superadmin
        </Button>
      </Link>
    </div>
  )
}
