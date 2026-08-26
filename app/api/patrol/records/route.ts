import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { BUSINESS_TIMEZONE } from '@/lib/timezone'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400 }
      )
    }

    const canViewAllSites = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN'
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ...(canViewAllSites
          ? {}
          : currentUser.role === 'CLIENT'
            ? { companyId: currentUser.companyId }
            : { id: currentUser.siteId }),
      },
      select: { id: true },
    })

    if (!site) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch attendance records for the authorized site (representing patrol records)
    const records = await prisma.attendance.findMany({
      where: {
        locationId: site.id,
      },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { clockInTime: 'desc' },
      take: 50,
    })

    // Transform to patrol record format
    const patrolRecords = records.map((record) => ({
      id: record.id,
      locationId: record.locationId,
      checkpoint: record.location.name,
      officer: record.user.name || 'Unknown',
      timestamp: record.clockInTime.toISOString(),
      time: record.clockInTime.toLocaleTimeString('en-GB', {
        timeZone: BUSINESS_TIMEZONE,
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }),
      date: record.clockInTime.toLocaleDateString('en-CA', {
        timeZone: BUSINESS_TIMEZONE,
        year: 'numeric', month: '2-digit', day: '2-digit',
      }),
      gpsStatus: record.gpsVerified ? 'verified' : 'unverified' as const,
      gpsVerified: record.gpsVerified,
      photos: 0,
      description: record.notes || null,
      notes: record.notes || null,
      evidence: [],
    }))

    return NextResponse.json(patrolRecords)
  } catch (error) {
    console.error('Error fetching patrol records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patrol records' },
      { status: 500 }
    )
  }
}
