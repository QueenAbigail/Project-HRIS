import { NextRequest, NextResponse } from 'next/server'
import { generateTodayAttendanceRecords } from '@/app/superadmin/actions'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

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
    const errorMessage = 'Failed to generate attendance records'
    
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

export async function POST(_req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    const allowedRoles = new Set(['SUPER_ADMIN', 'HR_ADMIN', 'SITE_ADMIN'])

    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required', success: false }, { status: 401 })
    }

    if (!allowedRoles.has(currentUser.role)) {
      return NextResponse.json({ error: 'You do not have permission to generate attendance', success: false }, { status: 403 })
    }

    return await handleAttendanceGeneration()
  } catch (error) {
    console.error('[v0] Error in POST handler:', error)
    return NextResponse.json(
      { error: 'Failed to process request', success: false },
      { status: 500 }
    )
  }
}

// Cron job handler - triggered by Vercel Cron at 17:00 UTC (00:00 GMT+7 next day)
// Creates attendance records for the next day to align with GMT+7 timezone
export async function GET(req: NextRequest) {
  try {
    // Verify this is a cron request from Vercel
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
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
