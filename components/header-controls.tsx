"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

interface HeaderControlsProps {
  userRole: string | null
}

export function HeaderControls({ userRole }: HeaderControlsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  const handleNavigateToSuperAdmin = () => {
    setIsLoading(true)
    
    // Navigate to superadmin
    router.push('/superadmin')
    
    // Reset loading state after 5 seconds as fallback in case navigation fails
    setTimeout(() => {
      setIsLoading(false)
    }, 5000)
  }

  if (!isSuperAdmin) {
    return null
  }

  return (
    <div className="ml-auto">
      <Button 
        onClick={handleNavigateToSuperAdmin}
        disabled={isLoading}
        size="sm" 
        className="gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="size-4 border-2 border-slate-900/30 border-t-slate-900 dark:border-slate-100/30 dark:border-t-slate-100 rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <ShieldAlert className="size-4" />
            <span>Superadmin</span>
          </>
        )}
      </Button>
    </div>
  )
}
