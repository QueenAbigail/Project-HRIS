'use server'

import { createClient } from '@/lib/auth'

export async function getAuthToken() {
  try {
    // Use the authenticated server client that reads from cookies
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[v0] getAuthToken error:', error)
      return null
    }
    
    if (!session?.access_token) {
      console.error('[v0] getAuthToken: No session or token found')
      return null
    }
    
    console.log('[v0] getAuthToken: Successfully retrieved token for user:', session.user?.email)
    return session.access_token
  } catch (error) {
    console.error('[v0] getAuthToken exception:', error)
    return null
  }
}
