'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useLoadingContext } from '@/lib/loading-context'

interface WelcomeToastProps {
  userName: string | null
}

export function WelcomeToast({ userName }: WelcomeToastProps) {
  const { isLoading } = useLoadingContext()
  const startTimeRef = useRef<number>(0)
  const minDurationMs = 2000 // Minimum 2 seconds to display the toast

  useEffect(() => {
    // Check if login toast was already shown on the login page
    const loginToastShown = sessionStorage.getItem('loginToastShown')
    
    if (loginToastShown) {
      // Clear the flag and record start time for dismissal tracking
      sessionStorage.removeItem('loginToastShown')
      startTimeRef.current = Date.now()
    }
  }, [])

  useEffect(() => {
    // If we have a start time recorded (toast was shown on login page), dismiss when loading finishes
    if (startTimeRef.current > 0 && !isLoading) {
      const elapsedTime = Date.now() - startTimeRef.current

      if (elapsedTime >= minDurationMs) {
        // Dismiss immediately if minimum duration has passed
        toast.dismiss()
        startTimeRef.current = 0
      } else {
        // Wait for minimum duration before dismissing
        const remainingTime = minDurationMs - elapsedTime
        const timeout = setTimeout(() => {
          toast.dismiss()
          startTimeRef.current = 0
        }, remainingTime)

        return () => clearTimeout(timeout)
      }
    }
  }, [isLoading])

  return null
}

