'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useLoadingContext } from '@/lib/loading-context'

interface WelcomeToastProps {
  userName: string | null
}

export function WelcomeToast({ userName }: WelcomeToastProps) {
  const { isLoading } = useLoadingContext()
  const toastIdRef = useRef<string | number | null>(null)
  const startTimeRef = useRef<number>(0)
  const minDurationMs = 2000 // Minimum 2 seconds to display the toast
  const maxDurationMs = 8000 // Maximum 8 seconds

  useEffect(() => {
    // Check if user just logged in by checking session storage
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome')

    if (!hasShownWelcome && userName) {
      startTimeRef.current = Date.now()
      
      toastIdRef.current = toast.success(`Welcome, ${userName}!`, {
        description: 'Please wait while we redirect you to the dashboard.',
        duration: maxDurationMs, // Set max duration initially
      })

      sessionStorage.setItem('hasShownWelcome', 'true')
    }
  }, [userName])

  useEffect(() => {
    // Check if loading has finished and minimum duration has passed
    if (toastIdRef.current !== null && !isLoading && startTimeRef.current > 0) {
      const elapsedTime = Date.now() - startTimeRef.current

      if (elapsedTime >= minDurationMs) {
        // Dismiss the toast immediately if minimum duration passed
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = null
      } else {
        // Wait for minimum duration before dismissing
        const remainingTime = minDurationMs - elapsedTime
        const timeout = setTimeout(() => {
          if (toastIdRef.current !== null) {
            toast.dismiss(toastIdRef.current)
            toastIdRef.current = null
          }
        }, remainingTime)

        return () => clearTimeout(timeout)
      }
    }
  }, [isLoading])

  return null
}

