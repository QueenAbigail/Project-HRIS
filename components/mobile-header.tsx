'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useSwipe } from '@/hooks/use-swipe'

export function MobileHeader() {
  const { toggleSidebar, openMobile } = useSidebar()
  
  // Enable swipe from left edge to open sidebar
  useSwipe({
    onSwipeRight: () => {
      if (!openMobile) {
        toggleSidebar()
      }
    },
  })

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden size-9"
      onClick={toggleSidebar}
      aria-label="Open menu"
    >
      <Menu className="size-5" />
    </Button>
  )
}
