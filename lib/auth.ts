'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// 1. Pindahkan dan ubah createClient jadi async
export async function createClient() {
  const cookieStore = await cookies() // Sekarang cookies-nya aman di dalam fungsi dan pakai await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  
  // Redirect to dashboard on successful login
  redirect('/dashboard')
}

export async function logout() {
  // 3. Tambahkan await juga di sini
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
