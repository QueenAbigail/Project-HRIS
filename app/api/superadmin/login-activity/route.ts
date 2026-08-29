import { NextResponse } from 'next/server'
import { getLoginActivity } from '@/lib/auth-activity'
import { getCurrentUserRole } from '@/lib/system'

export async function GET() {
  const role = await getCurrentUserRole()
  if (role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const activities = await getLoginActivity(20)
  return NextResponse.json({ activities })
}
