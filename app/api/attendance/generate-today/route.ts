import { NextRequest, NextResponse } from 'next/server'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'
import { createClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Verify authorization - only admins can call this
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role from database
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    // Only SUPER_ADMIN and HR_ADMIN can trigger this
    const allowedRoles = ['SUPER_ADMIN', 'HR_ADMIN', 'SITE_ADMIN']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Generate attendance records
    const result = await generateTodayAttendanceRecords()

    return NextResponse.json({
      success: true,
      message: result.message,
      details: result.details
    })
  } catch (error) {
    console.error('[v0] Error generating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to generate attendance records' },
      { status: 500 }
    )
  }
}

// Cron job handler - triggered by Vercel Cron at 00:00 GMT+7 (17:00 UTC previous day)
export async function GET(req: NextRequest) {
  // Verify this is a cron request from Vercel
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized cron request' },
      { status: 401 }
    )
  }

  try {
    const result = await generateTodayAttendanceRecords()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: result.message,
      details: result.details
    })
  } catch (error) {
    console.error('[v0] Cron error generating attendance:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
