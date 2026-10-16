import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import {
  firstOfMonth,
  salaryBaseInputSchema,
  summarizeSiteWage,
  todayInJakarta,
  toDbDate,
} from '@/lib/salary-base'

async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET() {
  const denied = await access(); if (denied) return denied
  try {
    const today = todayInJakarta()
    const sites = await prisma.site.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, salaryBases: true },
    })
    return NextResponse.json({ today, sites: sites.map((site) => summarizeSiteWage(site, today)) })
  } catch (error) {
    console.error('[v0] Failed to fetch salary base:', error)
    return NextResponse.json({ error: 'Failed to fetch minimum wages' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const denied = await access(); if (denied) return denied
  const parsed = salaryBaseInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const { siteId, minimumWage } = parsed.data
  try {
    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { id: true } })
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

    const today = todayInJakarta()
    const hasCurrent = (await prisma.salaryBase.count({ where: { siteId, effectiveDate: { lte: toDbDate(today) } } })) > 0
    const effectiveDate = toDbDate(firstOfMonth(today, hasCurrent ? 1 : 0))

    await prisma.salaryBase.upsert({
      where: { siteId_effectiveDate: { siteId, effectiveDate } },
      create: { siteId, minimumWage, effectiveDate },
      update: { minimumWage },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Failed to save minimum wage:', error)
    return NextResponse.json({ error: 'Failed to save minimum wage' }, { status: 500 })
  }
}
