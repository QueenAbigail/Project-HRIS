'use client'

import { ReactNode, useState, useEffect } from 'react'

interface PageLoadingWrapperProps {
  skeleton: ReactNode
  children: ReactNode
  minLoadingTime?: number
}

export function PageLoadingWrapper({
  skeleton,
  children,
  minLoadingTime = 500,
}: PageLoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show skeleton for minimum time, then show actual content
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, minLoadingTime)

    return () => clearTimeout(timer)
  }, [minLoadingTime])

  return (
    <>
      {isLoading && (
        <div className="animate-pulse">
          {skeleton}
        </div>
      )}
      {!isLoading && (
        <>{children}</>
      )}
    </>
  )
}
