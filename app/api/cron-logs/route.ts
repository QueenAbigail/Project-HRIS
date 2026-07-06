import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated as admin
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get latest cron logs
    const limit = request.nextUrl.searchParams.get('limit') || '10'
    const jobName = request.nextUrl.searchParams.get('jobName')

    const logs = await prisma.cronLog.findMany({
      where: jobName ? { jobName } : {},
      orderBy: { startTime: 'desc' },
      take: parseInt(limit)
    })

    // Calculate summary stats
    const recentLogs = await prisma.cronLog.findMany({
      where: {
        startTime: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    const summary = {
      totalRuns: recentLogs.length,
      successfulRuns: recentLogs.filter(l => l.status === 'SUCCESS').length,
      failedRuns: recentLogs.filter(l => l.status === 'ERROR').length,
      averageDuration: recentLogs.length > 0
        ? Math.round(
            recentLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / recentLogs.length
          )
        : 0,
      totalRecordsCreated: recentLogs.reduce((sum, l) => sum + (l.recordsCreated || 0), 0),
      totalRecordsSkipped: recentLogs.reduce((sum, l) => sum + (l.recordsSkipped || 0), 0)
    }

    return NextResponse.json({
      logs,
      summary,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error fetching cron logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cron logs' },
      { status: 500 }
    )
  }
}
