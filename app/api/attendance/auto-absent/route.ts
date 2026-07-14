import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentTimeGMT7, parseLocalDateTime } from '@/lib/timezone'

/**
 * Cron endpoint to auto-update NOT_CHECKED_IN records to ABSENT
 * when their scheduled end time has passed.
 * 
 * This should be called periodically (e.g., every 5-10 minutes) via a cron job.
 * Best practice: Use this instead of checking on every API call for better performance.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET
    
    if (!authHeader || !expectedSecret) {
      return NextResponse.json(
        { error: 'Missing authentication' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    if (token !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid authorization' },
        { status: 401 }
      )
    }

    // Get current time in GMT+7 timezone
    const now = getCurrentTimeGMT7()
    
    console.log('[v0] Auto-absent cron job started')
    console.log('[v0] GMT+7 current time:', now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))

    // Find all NOT_CHECKED_IN records where the scheduled end time has passed
    const pendingRecords = await prisma.attendance.findMany({
      where: {
        status: 'NOT_CHECKED_IN',
        date: {
          lte: now // Only check records from today and earlier (GMT+7)
        }
      },
      select: {
        id: true,
        date: true,
        scheduledEnd: true,
        user: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })

    console.log(`[v0] Found ${pendingRecords.length} NOT_CHECKED_IN records`)

    // Filter records where scheduled end time has passed, or if it's an old pending record
    const recordsToUpdate = pendingRecords.filter(record => {
      const recordDateStr = record.date.toISOString().split('T')[0] // Convert to YYYY-MM-DD
      const endOfDay = parseLocalDateTime(recordDateStr, '23:59:59')

      // If record has scheduledEnd, check if that time has passed (in GMT+7)
      if (record.scheduledEnd) {
        const endTime = parseLocalDateTime(recordDateStr, record.scheduledEnd)
        const shouldUpdate = now > endTime
        
        console.log(`[v0] Checking ${record.user.name} (${recordDateStr}): scheduled until ${record.scheduledEnd}, now is ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}, shouldUpdate=${shouldUpdate}`)
        return shouldUpdate
      }

      // If no scheduledEnd (old records), mark as absent if the day has passed (GMT+7)
      return now > endOfDay
    })

    console.log(
      `[v0] Auto-updating ${recordsToUpdate.length} records to ABSENT`,
      recordsToUpdate.map(r => ({
        userId: r.user.id,
        userName: r.user.name,
        date: r.date,
        scheduledEnd: r.scheduledEnd
      }))
    )

    // Update records to ABSENT
    if (recordsToUpdate.length > 0) {
      await prisma.attendance.updateMany({
        where: {
          id: {
            in: recordsToUpdate.map(r => r.id)
          },
          status: 'NOT_CHECKED_IN'
        },
        data: {
          status: 'ABSENT'
        }
      })

      console.log('[v0] Successfully updated', recordsToUpdate.length, 'records to ABSENT')
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${recordsToUpdate.length} records from NOT_CHECKED_IN to ABSENT`,
      updatedCount: recordsToUpdate.length,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error('[v0] Error in auto-absent cron:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        error: 'Failed to update attendance records',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
