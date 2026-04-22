"use client"

import { createBrowserClient } from '@supabase/ssr'
import type { SystemSettings } from '@prisma/client'

export async function fetchSystemSettings(): Promise<Omit<SystemSettings, 'id'> | null> {
  const response = await fetch('/api/system-settings', {
    cache: 'no-store'
  })
  if (!response.ok) return null
  return response.json()
}

export async function fetchUserRole() {
  // Ini yang kita ganti pakai format SSR yang bener
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.email) return null

  const response = await fetch(`/api/user-role?email=${encodeURIComponent(session.user.email)}`, {
    cache: 'no-store'
  })
  if (!response.ok) return null
  const { role } = await response.json()
  return role
}