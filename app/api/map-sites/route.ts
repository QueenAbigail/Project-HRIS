import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const endOfDay = new Date(startOfDay)
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)

  try {
    const [employees, attendance] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'STAFF' },
        select: { siteId: true },
      }),
      prisma.attendance.findMany({
        where: {
          date: { gte: startOfDay, lt: endOfDay },
          user: { role: 'STAFF' },
        },
        select: { userId: true, status: true },
      }),
    ])

    const totalBySite = new Map<string, number>()
    for (const employee of employees) {
      totalBySite.set(employee.siteId, (totalBySite.get(employee.siteId) ?? 0) + 1)
    }

    const presentBySite = new Map<string, number>()
    const lateBySite = new Map<string, number>()
    const employeeSiteById = new Map<string, string>()
    const employeeRows = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: { id: true, siteId: true },
    })
    for (const employee of employeeRows) employeeSiteById.set(employee.id, employee.siteId)

    for (const record of attendance) {
      const siteId = employeeSiteById.get(record.userId)
      if (!siteId) continue
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        presentBySite.set(siteId, (presentBySite.get(siteId) ?? 0) + 1)
      }
      if (record.status === 'LATE') {
        lateBySite.set(siteId, (lateBySite.get(siteId) ?? 0) + 1)
      }
    }

    return NextResponse.json(
      Object.fromEntries(
        totalBySite.keys().map((siteId) => [siteId, {
          totalStaff: totalBySite.get(siteId) ?? 0,
          presentCount: presentBySite.get(siteId) ?? 0,
          lateCount: lateBySite.get(siteId) ?? 0,
        }]),
      ),
    )
  } catch (error) {
    console.error('[v0] Failed to load map site attendance:', error)
    return NextResponse.json({ error: 'Failed to load site attendance' }, { status: 500 })
  }
}
