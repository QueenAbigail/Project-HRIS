import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

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
        location: { siteId: site.id },
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
      checkpoint: record.location.name,
      officer: record.user.name || 'Unknown',
      timestamp: record.clockInTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      date: record.clockInTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      gpsStatus: record.gpsVerified ? 'verified' : 'unverified' as const,
      photos: 0, // To be implemented with actual photo storage
      description: record.notes || 'Patrol record',
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
