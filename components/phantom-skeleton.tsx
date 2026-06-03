'use client'

import { useEffect, ReactNode, createElement } from 'react'

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

  // Use createElement to avoid JSX namespace issues with Web Components
  const attrs: Record<string, any> = {
    animation,
    duration: duration.toString(),
    // When loading, hide the actual content and show skeleton
    // display: 'contents' allows phantom-ui to measure children without affecting layout
    style: loading ? { visibility: 'hidden', position: 'absolute', pointerEvents: 'none' } : { display: 'contents' },
  }

  // Only add attributes if they have values
  if (loading) attrs['attr:loading'] = ''
  if (debug) attrs.debug = ''
  if (count) attrs.count = count.toString()
  if (countGap) attrs['count-gap'] = countGap.toString()

  return createElement('phantom-ui', attrs, children)
}
