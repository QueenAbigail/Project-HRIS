import { NextRequest, NextResponse } from 'next/server'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'

// Shared handler for both manual (POST with auth header) and cron (GET) requests
async function handleAttendanceGeneration() {
  try {
    const result = await generateTodayAttendanceRecords()
    return NextResponse.json({
      success: true,
      message: result.message,
      details: result.details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error generating attendance:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate attendance records'
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[v0] POST /api/attendance/generate-today called')
    
    // Verify the secret token for security
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET || 'development-secret'
    
    console.log('[v0] Auth header present:', !!authHeader)
    console.log('[v0] CRON_SECRET env set:', !!process.env.CRON_SECRET)
    console.log('[v0] Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'none')
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      console.log('[v0] Authorization failed - token mismatch')
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    console.log('[v0] Authorization passed, calling generateTodayAttendanceRecords')
    return await handleAttendanceGeneration()
  } catch (error) {
    console.error('[v0] Error in POST handler:', error)
    return NextResponse.json(
      { error: 'Failed to process request', success: false },
      { status: 500 }
    )
  }
}

// Cron job handler - triggered by Vercel Cron at 00:00 GMT+7 (17:00 UTC previous day)
export async function GET(req: NextRequest) {
  try {
    // Verify this is a cron request from Vercel
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET || 'development-secret'
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized cron request', success: false },
        { status: 401 }
      )
    }

    return await handleAttendanceGeneration()
  } catch (error) {
    console.error('[v0] Cron error:', error)
    return NextResponse.json(
      { error: 'Cron job failed', success: false },
      { status: 500 }
    )
  }
}
