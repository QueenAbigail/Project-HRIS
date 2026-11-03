import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { getBusinessDate, getBusinessDateRange } from '@/lib/timezone'
import { tallyAttendance } from '@/lib/attendance-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isUnrestricted = user.role === 'SUPER_ADMIN' || user.role === 'HR_ADMIN'
  const { from, to } = getBusinessDateRange(getBusinessDate())

  try {
    const [employees, attendance] = await Promise.all([
      prisma.user.findMany({
        where: isUnrestricted ? {} : { companyId: user.companyId },
        select: { siteId: true },
      }),
      prisma.attendance.findMany({
        where: {
          date: { gte: from, lte: to },
          ...(isUnrestricted ? {} : { location: { companyId: user.companyId } }),
        },
        select: {
          locationId: true,
          actualCheckIn: true,
          status: true,
          lateMinutes: true,
          user: { select: { siteId: true } },
        },
      }),
    ])

    const totalBySite = new Map<string, number>()
    for (const employee of employees) {
      totalBySite.set(employee.siteId, (totalBySite.get(employee.siteId) ?? 0) + 1)
    }

    const recordsBySite = new Map<string, typeof attendance>()
    for (const record of attendance) {
      const siteId = record.locationId ?? record.user.siteId
      const records = recordsBySite.get(siteId) ?? []
      records.push(record)
      recordsBySite.set(siteId, records)
    }

    const siteIds = new Set([...totalBySite.keys(), ...recordsBySite.keys()])
    const result: Record<string, { totalStaff: number; presentCount: number; lateCount: number }> = {}

    for (const siteId of siteIds) {
      const tally = tallyAttendance(recordsBySite.get(siteId) ?? [])
      result[siteId] = {
        totalStaff: totalBySite.get(siteId) ?? 0,
        presentCount: tally.present + tally.late,
        lateCount: tally.late,
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Failed to load map site attendance:', error)
    return NextResponse.json({ error: 'Failed to load site attendance' }, { status: 500 })
  }
}
