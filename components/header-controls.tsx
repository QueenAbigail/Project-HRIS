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
          className="gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium transition-all duration-200 active:scale-95"
        >
          <ShieldAlert className="size-4" />
          Superadmin
        </Button>
      </Link>
    </div>
  )
}
