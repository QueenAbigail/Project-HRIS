import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export type AuthChannel = 'WEB' | 'MOBILE'

export type LoginInput = {
  email: string
  password: string
  channel: AuthChannel
  deviceId?: string
  remember?: boolean
}

export async function performLogin({ email, password, channel, deviceId, remember = false }: LoginInput) {
  const normalizedEmail = email.trim().toLowerCase()
  const requestHeaders = await headers()
  const ipAddress = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
    || requestHeaders.get('x-real-ip')
    || null
  const userAgent = requestHeaders.get('user-agent') || null

  if (!normalizedEmail || !password) {
    await recordLoginAttempt({
      email: normalizedEmail,
      channel,
      result: 'FAILED_OTHER',
      deviceId,
      ipAddress,
      userAgent,
    })
    return { error: 'Email and password are required' }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
          const sessionOptions = { ...options }
          if (remember) {
            sessionOptions.maxAge = 60 * 60 * 24 * 30
          } else {
            delete sessionOptions.maxAge
            delete sessionOptions.expires
          }
          cookieStore.set(name, value, sessionOptions)
        })
          } catch {
            // Server Component renders cannot always mutate cookies.
          }
        },
      },
    },
  )
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (error || !data.user) {
    await recordLoginAttempt({
      email: normalizedEmail,
      channel,
      result: 'FAILED_INVALID_CREDENTIALS',
      deviceId,
      ipAddress,
      userAgent,
    })
    return { error: 'Invalid email or password' }
  }

  await recordLoginAttempt({
    email: normalizedEmail,
    channel,
    result: 'SUCCESS',
    userId: data.user.id,
    deviceId,
    ipAddress,
    userAgent,
  })

  return {
    success: true,
    userName: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
  }
}

async function recordLoginAttempt({
  email,
  channel,
  result,
  userId,
  deviceId,
  ipAddress,
  userAgent,
}: {
  email: string
  channel: AuthChannel
  result: 'SUCCESS' | 'FAILED_INVALID_CREDENTIALS' | 'FAILED_DEVICE_LIMIT' | 'FAILED_OTHER'
  userId?: string
  deviceId?: string
  ipAddress: string | null
  userAgent: string | null
}) {
  try {
    await prisma.authActivityLog.create({
      data: {
        email,
        channel,
        result,
        userId,
        deviceId,
        ipAddress,
        userAgent,
      },
    })
  } catch (logError) {
    console.error('[v0] Failed to record login activity:', logError)
  }
}
