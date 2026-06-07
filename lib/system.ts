"use server"

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/auth'

import type { SystemSettings, User } from '@prisma/client'

export async function getSystemSettings(): Promise<Omit<SystemSettings, 'id'> | null> {
  const defaultSettings = {
    logoUrl: '/logo.png',
    appName: 'SecureGuard HR',
    appDescription: 'HR Administration Dashboard'
  }

  try {
    if (!prisma) {
      return defaultSettings
    }
    
    const settings = await prisma.systemSettings.findFirst()
    return settings ? {
      logoUrl: settings.logoUrl,
      appName: settings.appName,
      appDescription: settings.appDescription,
    } : defaultSettings
  } catch (error) {
    // Silently return defaults on error (e.g., during build when DATABASE_URL is not set)
    return defaultSettings
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) return null

    if (!prisma) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    return user?.role || null
  } catch (error) {
    // Silently return null on error
    return null
  }
}

