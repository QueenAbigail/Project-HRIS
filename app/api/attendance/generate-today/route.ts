import { NextRequest, NextResponse } from 'next/server'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'
import { prisma } from '@/lib/prisma'

// Shared handler for both manual (POST with auth header) and cron (GET) requests
async function handleAttendanceGeneration() {
  const startTime = Date.now()
  let cronLogId: string | null = null

  try {
    // Create a cron log entry
    const cronLog = await prisma.cronLog.create({
      data: {
        jobName: 'ATTENDANCE_GENERATION',
        status: 'RUNNING',
        startTime: new Date()
      }
    })
    cronLogId = cronLog.id

    const result = await generateTodayAttendanceRecords()
    const duration = Date.now() - startTime

    // Update the cron log with results
    await prisma.cronLog.update({
      where: { id: cronLogId },
      data: {
        status: 'SUCCESS',
        recordsCreated: result.details?.created || 0,
        recordsSkipped: result.details?.skipped || 0,
        message: result.message || 'Attendance records generated successfully',
        duration,
        endTime: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: result.message,
      details: result.details,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate attendance records'
    
    console.error('[v0] Error generating attendance:', error)

    // Update the cron log with error
    if (cronLogId) {
      try {
        await prisma.cronLog.update({
          where: { id: cronLogId },
          data: {
            status: 'ERROR',
            error: errorMessage,
            duration,
            endTime: new Date()
          }
        })
      } catch (logError) {
        console.error('[v0] Failed to log cron error:', logError)
      }
    }

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
