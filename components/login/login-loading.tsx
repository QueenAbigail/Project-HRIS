'use client'

import { motion, type Variants } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LoginLoadingProps {
  logoUrl?: string | null
  appName?: string | null
}

export function LoginLoading({ logoUrl, appName }: LoginLoadingProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  const pulseVariants: Variants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        {/* Logo Container with Pulse Animation */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className={`flex items-center justify-center p-6 rounded-lg border ${isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'
            }`}
        >
          <img
            src={logoUrl || '/koperasi_icon.png'}
            alt={appName || 'App logo'}
            className="h-auto w-auto max-h-20 max-w-[140px] object-contain"
          />
        </motion.div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-foreground">{appName || 'Loading'}</p>
          <div className="flex gap-1">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
