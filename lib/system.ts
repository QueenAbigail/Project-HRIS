"use server"

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/auth'

import type { SystemSettings, User } from '@prisma/client'

export async function getSystemSettings(): Promise<Omit<SystemSettings, 'id'> | null> {
  try {
    const settings = await prisma.systemSettings.findFirst()
    return settings ? {
      logoUrl: settings.logoUrl,
      appName: settings.appName,
      appDescription: settings.appDescription,
    } : null
  } catch (error) {
    console.error('[v0] Failed to fetch system settings:', error)
    return null
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) return null

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

