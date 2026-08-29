import { NextResponse } from 'next/server'
import { getLoginActivity } from '@/lib/auth-activity'

export async function GET() {
  const activities = await getLoginActivity(20)
  return NextResponse.json({ activities })
}
