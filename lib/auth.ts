'use server'

import { createServerClient } from '@supabase/ssr'
import { performLogin } from '@/lib/auth-login'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Admin client for server-side operations (uses service role key)
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(`Supabase configuration is missing. URL: ${!!supabaseUrl}, ServiceKey: ${!!supabaseServiceKey}`)
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// 1. User client for auth operations (anon key)
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Supabase configuration is missing. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`)
  }

  const cookieStore = await cookies() // Sekarang cookies-nya aman di dalam fungsi dan pakai await

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Abaikan error saat render Server Component
          }
        },
      },
    }
  )
}

// Resolve the signed-in user's email from the session JWT.
// Uses getClaims() which verifies the token signature locally (asymmetric keys)
// instead of making a network call to the Supabase Auth server on every request.
// getClaims() still calls getSession() internally, so an expired token is refreshed.
export async function getAuthEmail(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    const email = data?.claims?.email
    return typeof email === 'string' ? email : null
  } catch (error) {
    console.error('[v0] Failed to resolve auth email:', error)
    return null
  }
}

export async function login(email: string, password: string, remember: boolean) {
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const result = await performLogin({
    email,
    password,
    channel: 'WEB',
  })

  return result
}

export async function logout() {
  // 3. Tambahkan await juga di sini
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}
