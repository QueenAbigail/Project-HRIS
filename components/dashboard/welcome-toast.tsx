'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

interface WelcomeToastProps {
  userName: string | null
}

export function WelcomeToast({ userName }: WelcomeToastProps) {
  useEffect(() => {
    // Check if user just logged in by checking session storage
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome')
    
    if (!hasShownWelcome && userName) {
      toast.success('Welcome back!', {
        description: `Hello ${userName}, you have been successfully logged in.`,
        duration: 3000,
      })
      sessionStorage.setItem('hasShownWelcome', 'true')
    }
  }, [userName])

  return null
}
