"use server"

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/auth'

import type { SystemSettings, User } from '@prisma/client'

export async function getSystemSettings(): Promise<Omit<SystemSettings, 'id'> | null> {
  try {
    if (!prisma) {
      console.warn('[v0] Prisma client not available, returning default settings')
      return {
        logoUrl: '/logo.png',
        appName: 'SecureGuard HR',
        appDescription: 'HR Administration Dashboard'
      }
    }
    
    const settings = await prisma.systemSettings.findFirst()
    return settings ? {
      logoUrl: settings.logoUrl,
      appName: settings.appName,
      appDescription: settings.appDescription,
    } : {
      logoUrl: '/logo.png',
      appName: 'SecureGuard HR',
      appDescription: 'HR Administration Dashboard'
    }
  } catch (error) {
    console.error('[v0] Failed to fetch system settings:', error)
    // Return default settings when database is unavailable
    return {
      logoUrl: '/logo.png',
      appName: 'SecureGuard HR',
      appDescription: 'HR Administration Dashboard'
    }
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) return null

    if (!prisma) {
      console.warn('[v0] Prisma client not available')
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    return user?.role || null
  } catch (error) {
    console.error('[v0] Failed to fetch user role:', error)
    return null
  }
}

