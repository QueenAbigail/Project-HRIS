'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for session cookie
    const hasSession = document.cookie.includes('session=')
    
    if (!hasSession) {
      router.replace('/login')
    } else {
      setIsAuthenticated(true)
    }
    setIsChecking(false)
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="size-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
