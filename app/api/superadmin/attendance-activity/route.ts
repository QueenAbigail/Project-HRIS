import { NextRequest, NextResponse } from 'next/server'
import { getAttendanceActivity } from '@/lib/auth-activity'

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 100)
  return NextResponse.json({ activities: await getAttendanceActivity(Number.isFinite(limit) ? limit : 100) })
}
