'use client'

import { useEffect, useRef } from 'react'

interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe(options: SwipeOptions) {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = options
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
      const diff = touchEndX.current - touchStartX.current
      
      // Only trigger if swipe starts from near the left edge (within 30px)
      if (touchStartX.current < 30 && diff > threshold && onSwipeRight) {
        onSwipeRight()
      } else if (diff < -threshold && onSwipeLeft) {
        onSwipeLeft()
      }
      
      // Reset values
      touchStartX.current = 0
      touchEndX.current = 0
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, threshold])
}
