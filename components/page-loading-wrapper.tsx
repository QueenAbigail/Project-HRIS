'use client'

import { ReactNode, useState, useEffect } from 'react'
import { PhantomSkeleton } from './phantom-skeleton'

interface PageLoadingWrapperProps {
  skeleton: ReactNode
  children: ReactNode
  minLoadingTime?: number
}

export function PageLoadingWrapper({
  skeleton,
  children,
  minLoadingTime = 400, // Minimum time skeleton shows (in ms)
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
    <div>
      {isLoading ? (
        <PhantomSkeleton loading={true} animation="shimmer">
          {skeleton}
        </PhantomSkeleton>
      ) : (
        children
      )}
    </div>
  )
}
