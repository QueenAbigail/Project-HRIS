'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(email: string, password: string, remember: boolean) {
  // In a real app, you would validate credentials against a database
  // For now, we'll just create a session cookie
  
  // Simple validation (replace with actual auth logic)
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const cookieStore = await cookies()
  
  // Set session cookie
  // If "remember me" is checked, cookie expires in 30 days, otherwise it's a session cookie
  cookieStore.set('session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(remember && { maxAge: 60 * 60 * 24 * 30 }), // 30 days if remember is checked
  })

  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}
