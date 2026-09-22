import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/system'

export async function requireSuperAdminResponse(): Promise<NextResponse | null> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
