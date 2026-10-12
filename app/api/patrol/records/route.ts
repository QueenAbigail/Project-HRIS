import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { BUSINESS_TIMEZONE, getBusinessDateBounds, getBusinessDateRange } from '@/lib/timezone'
import { calculateGpsDistanceMeters } from '@/lib/patrol-gps'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const dateFilter = searchParams.get('date')

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

    const { todayStart, todayEnd } = getBusinessDateBounds()
    const requestedDate = dateFilter && /^\d{4}-\d{2}-\d{2}$/.test(dateFilter) ? dateFilter : null
    const dateRange = requestedDate ? getBusinessDateRange(requestedDate) : null
    const records = await prisma.patrol.findMany({
      where: {
        siteId: site.id,
        status: 'COMPLETED',
        ...(dateFilter === 'today' || requestedDate ? { checkInTime: { gte: dateRange?.from ?? todayStart, lt: dateRange ? new Date(dateRange.to.getTime() + 1) : todayEnd } } : {}),
      },
        include: {
        patrolLocation: { select: { name: true, latitude: true, longitude: true } },
        user: { select: { name: true } },
        evidence: { select: { imageUrl: true, caption: true } },
      },
      orderBy: { checkInTime: 'desc' },
      take: 50,
    })

    const patrolRecords = records.map((record) => {
      const timestamp = record.checkInTime ?? record.createdAt
      const distanceMeters = record.gpsLat != null && record.gpsLng != null
        ? calculateGpsDistanceMeters(
            Number(record.gpsLat),
            Number(record.gpsLng),
            Number(record.patrolLocation.latitude),
            Number(record.patrolLocation.longitude),
          )
        : null
      return {
        id: record.id,
        locationId: record.patrolLocationId,
        checkpoint: record.patrolLocation.name,
        officer: record.user.name || 'Unknown',
        timestamp: timestamp.toISOString(),
        time: timestamp.toLocaleTimeString('en-GB', {
          timeZone: BUSINESS_TIMEZONE,
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        }),
        date: timestamp.toLocaleDateString('en-CA', {
          timeZone: BUSINESS_TIMEZONE,
          year: 'numeric', month: '2-digit', day: '2-digit',
        }),
        gpsStatus: record.gpsValidated ? 'verified' : 'unverified' as const,
        gpsVerified: record.gpsValidated,
        distanceMeters: distanceMeters === null ? null : Math.round(distanceMeters),
        photos: record.evidence.length,
        description: record.description || null,
        notes: record.description || null,
        evidence: record.evidence.map((item) => item.imageUrl).filter(Boolean),
      }
    })

    return NextResponse.json(patrolRecords)
  } catch (error) {
    console.error('Error fetching patrol records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patrol records' },
      { status: 500 }
    )
  }
}
