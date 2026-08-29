import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const MAX_BODY_BYTES = 8_000
const MAX_ATTEMPTS = 10
const WINDOW_MS = 60_000
const attempts = new Map<string, { count: number; resetAt: number }>()

const text = (value: unknown, max: number) => typeof value === 'string' && value.trim().length > 0 && value.length <= max ? value.trim() : null

function requestIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || null
}

function limited(key: string) {
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  current.count += 1
  return current.count > MAX_ATTEMPTS
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const body = await request.json() as Record<string, unknown>
    if (Object.keys(body).some((key) => !['email', 'channel', 'result', 'deviceId', 'userAgent'].includes(key))) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const email = text(body.email, 320)?.toLowerCase()
    const channel = body.channel === 'MOBILE' ? 'MOBILE' : null
    const result = ['SUCCESS', 'FAILED_INVALID_CREDENTIALS', 'FAILED_DEVICE_LIMIT', 'FAILED_OTHER'].includes(String(body.result)) ? body.result as 'SUCCESS' | 'FAILED_INVALID_CREDENTIALS' | 'FAILED_DEVICE_LIMIT' | 'FAILED_OTHER' : null
    const deviceId = text(body.deviceId, 256)
    const userAgent = text(body.userAgent, 1000)
    const ipAddress = requestIp(request)

    if (!email || !channel || !result || !deviceId || !userAgent || (result === 'SUCCESS' && !/^Bearer\s+/i.test(request.headers.get('authorization')?.trim() || ''))) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (result === 'FAILED_INVALID_CREDENTIALS' && limited(`${ipAddress || 'unknown'}:${email}`)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let userId: string | undefined
    const authorization = request.headers.get('authorization')?.trim()
    if (authorization) {
      const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i)
      const token = bearerMatch?.[1]?.trim()
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const supabase = createClient(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (data.user.email?.toLowerCase() !== email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      userId = data.user.id
    } else if (result !== 'FAILED_INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.authActivityLog.create({ data: { email, channel, result, deviceId, ipAddress, userAgent, userId } })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('[v0] Failed to record mobile login activity:', error)
    return NextResponse.json({ error: 'Unable to record activity' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
export const maxDuration = 10
