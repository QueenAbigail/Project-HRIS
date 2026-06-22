'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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

export async function login(email: string, password: string, remember: boolean) {
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // 2. Tambahkan await pas manggil createClient
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email, // Ingat: ini nerima dari app/page.tsx yang udah di-mapping pakai @hris.com
    password,
  })

  if (error) {
    console.error('Login error:', error)
    return { error: error.message }
  }

  // Get user metadata that includes name
  const userName = data?.user?.user_metadata?.name || data?.user?.email?.split('@')[0] || 'User'
  
  // Return success instead of redirecting immediately
  return { success: true, userName }
}

export async function logout() {
  // 3. Tambahkan await juga di sini
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { success: true }
}
