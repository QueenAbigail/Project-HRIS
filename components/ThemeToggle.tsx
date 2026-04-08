'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
      className="size-9 rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground shadow-inner transition-all duration-200 hover:scale-105"
      title="Toggle theme (light/dark/system)"
    >
      <Sun className={`h-4 w-4 ${theme === 'dark' || theme === 'system' ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} absolute transition-all duration-300 ease-in-out`} />
      <Moon className={`h-4 w-4 ${theme === 'light' ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} absolute transition-all duration-300 ease-in-out`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

