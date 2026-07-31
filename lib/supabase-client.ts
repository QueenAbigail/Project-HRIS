'use client'

import { createClient } from '@supabase/supabase-js'

// Client-side Supabase instance for use in Client Components
// This uses the public anon key and browser-stored session tokens
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

export async function getSupabaseSession() {
  const client = getSupabaseClient()
  const { data } = await client.auth.getSession()
  return data?.session
}
