import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { createAdminClient } from '@/lib/auth'

const BUCKET = 'attendance-photos'

function getStoragePath(value: string) {
  if (!value) return null

  try {
    const url = new URL(value)
    const marker = `/storage/v1/object/public/${BUCKET}/`
    if (url.pathname.startsWith(marker)) {
      return decodeURIComponent(url.pathname.slice(marker.length))
    }
  } catch {
    // The value may already be a storage path.
  }

  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    return value.replace(/^\/+/, '')
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attendanceId = new URL(request.url).searchParams.get('attendanceId')
    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 })
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      select: {
        selfieCheckIn: true,
        location: { select: { companyId: true } },
      },
    })

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HR_ADMIN'
    if (!isAdmin && attendance.location?.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const path = attendance.selfieCheckIn ? getStoragePath(attendance.selfieCheckIn) : null
    if (!path) {
      return NextResponse.json({ error: 'Selfie not available' }, { status: 404 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300)

    if (error || !data?.signedUrl) {
      console.error('[v0] Failed to create attendance selfie URL:', error?.message)
      return NextResponse.json({ error: 'Selfie not available' }, { status: 404 })
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error('[v0] Attendance selfie endpoint error:', error)
    return NextResponse.json({ error: 'Failed to load selfie' }, { status: 500 })
  }
}
