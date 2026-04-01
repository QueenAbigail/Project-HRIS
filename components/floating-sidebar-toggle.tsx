'use client'

import { PanelLeftIcon, PanelRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function FloatingSidebarToggle() {
  const { state, toggleSidebar, isMobile, openMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'

  // Don't show the button on mobile when sidebar sheet is open
  if (isMobile && openMobile) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'fixed z-50 size-10 rounded-full shadow-lg transition-all duration-300',
            'bg-card/95 backdrop-blur-sm border-border hover:bg-accent hover:scale-105',
            // Position based on sidebar state and screen size
            'bottom-4',
            isMobile 
              ? 'left-4'
              : isCollapsed 
                ? 'left-4' 
                : 'left-[17.5rem]'
          )}
        >
          {isMobile || isCollapsed ? (
            <PanelLeftIcon className="size-5" />
          ) : (
            <PanelRightIcon className="size-5" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="hidden md:block">
        <p>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} (Ctrl+B)</p>
      </TooltipContent>
    </Tooltip>
  )
}
