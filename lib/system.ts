"use server"

import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { getAuthEmail } from '@/lib/auth'
import { getSystemSettings as getCachedSystemSettings } from '@/lib/system-settings'

import type { User } from '@prisma/client'

export async function getSystemSettings() {
  return getCachedSystemSettings()
}

export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const email = await getAuthEmail()

    if (!email) return null

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    })

    return user?.role || null
  } catch (error) {
    console.error('[v0] Failed to fetch user role:', error)
    return null
  }
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const email = await getAuthEmail()

    if (!email) return null

    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        site: true
      }
    })

    return user || null
  } catch (error) {
    console.error('[v0] Failed to fetch current user:', error)
    return null
  }
})

