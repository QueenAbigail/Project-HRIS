import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { getBusinessDate } from '@/lib/timezone'
import { isValidAccuracy, isValidCoordinate, isValidLongitude, validatePatrolGps } from '@/lib/patrol-gps'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const patrolLocationId = typeof body.checkpointId === 'string'
      ? body.checkpointId
      : typeof body.patrolLocationId === 'string'
        ? body.patrolLocationId
        : null
    const latitude = body.currentLatitude ?? body.latitude
    const longitude = body.currentLongitude ?? body.longitude
    const accuracy = body.gpsAccuracy ?? body.accuracy

    if (!patrolLocationId || !isValidCoordinate(latitude) || !isValidLongitude(longitude) || !isValidAccuracy(accuracy)) {
      return NextResponse.json(
        { error: 'checkpointId, currentLatitude, currentLongitude, and non-negative gpsAccuracy are required' },
        { status: 400 },
      )
    }

    const location = await prisma.patrolLocation.findFirst({
      where: {
        id: patrolLocationId,
        isActive: true,
        ...(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN'
          ? {}
          : currentUser.role === 'CLIENT'
            ? { site: { companyId: currentUser.companyId } }
            : { siteId: currentUser.siteId }),
      },
      select: { id: true, siteId: true, latitude: true, longitude: true, radius: true },
    })

    if (!location) return NextResponse.json({ error: 'Patrol location not found' }, { status: 404 })

    const { gpsValidated, distanceMeters } = validatePatrolGps({
      patrolLatitude: latitude,
      patrolLongitude: longitude,
      accuracyMeters: accuracy,
      checkpointLatitude: location.latitude,
      checkpointLongitude: location.longitude,
      checkpointRadiusMeters: location.radius,
    })

    const patrolDate = new Date(`${getBusinessDate()}T00:00:00.000Z`)
    const patrol = await prisma.patrol.upsert({
      where: { userId_patrolLocationId_date: { userId: currentUser.id, patrolLocationId: location.id, date: patrolDate } },
      create: {
        userId: currentUser.id,
        siteId: location.siteId,
        patrolLocationId: location.id,
        date: patrolDate,
        status: 'COMPLETED',
        checkInTime: new Date(),
        gpsLat: latitude,
        gpsLng: longitude,
        gpsAccuracy: accuracy,
        gpsValidated,
        barcodeScanned: body.barcodeScanned === true,
        description: typeof body.description === 'string' ? body.description.trim() || null : null,
      },
      update: {
        status: 'COMPLETED',
        checkInTime: new Date(),
        gpsLat: latitude,
        gpsLng: longitude,
        gpsAccuracy: accuracy,
        gpsValidated,
        barcodeScanned: body.barcodeScanned === true,
        description: typeof body.description === 'string' ? body.description.trim() || null : null,
      },
      select: { id: true, gpsValidated: true, gpsAccuracy: true, gpsLat: true, gpsLng: true, checkInTime: true },
    })

    return NextResponse.json({ patrol, distanceMeters, radiusMeters: location.radius })
  } catch (error) {
    console.error('[v0] Patrol check-in failed:', error)
    return NextResponse.json({ error: 'Unable to record patrol check-in' }, { status: 500 })
  }
}
