'use server'

import { createAdminClient } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function getAuthToken() {
  try {
    const cookieStore = await cookies()
    
    // Get the session from cookies using the admin client
    const supabase = await createAdminClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[v0] getAuthToken error:', error)
      return null
    }
    
    if (!session?.access_token) {
      console.error('[v0] getAuthToken: No session or token found')
      return null
    }
    
    console.log('[v0] getAuthToken: Successfully retrieved token')
    return session.access_token
  } catch (error) {
    console.error('[v0] getAuthToken exception:', error)
    return null
  }
}
