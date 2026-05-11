'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UnauthorizedAccessProps {
  userRole: string | null
}

export function UnauthorizedAccess({ userRole }: UnauthorizedAccessProps) {
  const router = useRouter()

  useEffect(() => {
    if (userRole !== 'SUPER_ADMIN') {
      toast.error('You are not administrator', {
        description: 'You do not have permission to access this page.',
        duration: 3000,
      })
      
      // Redirect to dashboard after showing toast
      setTimeout(() => {
        router.replace('/dashboard')
      }, 500)
    }
  }, [userRole, router])

  return null
}
