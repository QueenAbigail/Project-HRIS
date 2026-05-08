'use client'

import * as React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider 
    attribute="class" 
    defaultTheme="system" 
    enableSystem
    disableTransitionOnChange
  >
    {children}
    <Toaster 
      theme="system"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-background border border-border text-foreground shadow-lg',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
          cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
          success: 'bg-background border border-success/30',
          error: 'bg-background border border-destructive/30',
          warning: 'bg-background border border-warning/30',
          info: 'bg-background border border-primary/30',
        },
      }}
    />
  </ThemeProvider>
}

