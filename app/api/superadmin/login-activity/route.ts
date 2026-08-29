import { NextResponse } from 'next/server'
import { getLoginActivity } from '@/lib/auth-activity'
import { getCurrentUserRole } from '@/lib/system'

export async function GET(request: Request) {
  const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get('limit') ?? 20) || 20))
  const role = await getCurrentUserRole()
  if (role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const activities = await getLoginActivity(limit)
  return NextResponse.json({ activities })
}
