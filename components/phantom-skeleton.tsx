'use client'

import { useEffect, ReactNode } from 'react'

interface PhantomSkeletonProps {
  loading: boolean
  children: ReactNode
  animation?: 'shimmer' | 'pulse' | 'breathe' | 'solid'
  duration?: number
  count?: number
  countGap?: number
  debug?: boolean
}

export function PhantomSkeleton({
  loading,
  children,
  animation = 'shimmer',
  duration = 1.5,
  count,
  countGap,
  debug = false,
}: PhantomSkeletonProps) {
  useEffect(() => {
    // Import phantom-ui on client side only
    import('@aejkatappaja/phantom-ui')
  }, [])

  return (
    <phantom-ui
      attr:loading={loading ? '' : null}
      animation={animation}
      duration={duration.toString()}
      count={count?.toString()}
      count-gap={countGap?.toString()}
      debug={debug ? '' : null}
      style={{
        display: 'contents',
      }}
    >
      {children}
    </phantom-ui>
  )
}
