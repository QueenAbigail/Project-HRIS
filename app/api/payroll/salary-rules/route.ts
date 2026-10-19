import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { firstOfMonth, summarizeSiteWage, todayInJakarta, toDbDate } from '@/lib/salary-base'
import { salaryRuleInputSchema, summarizeRules } from '@/lib/salary-rules'

async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET() {
  const denied = await access(); if (denied) return denied
  try {
    const today = todayInJakarta()
    const [sites, masterPositions, rules, headcount] = await Promise.all([
      prisma.site.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true, salaryBases: true },
      }),
      prisma.masterData.findMany({ where: { category: 'position' }, orderBy: { value: 'asc' } }),
      prisma.salaryRule.findMany(),
      prisma.user.groupBy({
        by: ['siteId', 'positionId'],
        where: { status: 'ACTIVE', positionId: { not: null } },
        _count: { _all: true },
      }),
    ])

    const nameById = new Map(masterPositions.map((p) => [p.id, p.value]))

    const employeesBySite = new Map<string, Map<string, number>>()
    for (const row of headcount) {
      const positionId = row.positionId
      if (!positionId) continue
      const counts = employeesBySite.get(row.siteId) ?? new Map<string, number>()
      counts.set(positionId, (counts.get(positionId) ?? 0) + row._count._all)
      employeesBySite.set(row.siteId, counts)
    }

    const result = sites.map((site) => {
      const wage = summarizeSiteWage(site, today)
      const counts = employeesBySite.get(site.id) ?? new Map<string, number>()
      const siteRules = rules.filter((r) => r.siteId === site.id)

      const positionIds = new Set<string>([...counts.keys(), ...siteRules.map((r) => r.positionId)])
      const positionRows = [...positionIds]
        .filter((id) => nameById.has(id))
        .map((positionId) => ({
          positionId,
          positionName: nameById.get(positionId)!,
          employeeCount: counts.get(positionId) ?? 0,
          ...summarizeRules(siteRules.filter((r) => r.positionId === positionId), today),
        }))
        .sort((a, b) => a.positionName.localeCompare(b.positionName))

      return {
        siteId: site.id,
        siteName: site.name,
        siteCode: site.code,
        minimumWage: wage.current?.minimumWage ?? null,
        rows: positionRows,
      }
    })

    return NextResponse.json({
      today,
      sites: result,
      positions: masterPositions.filter((p) => p.isActive).map((p) => ({ id: p.id, name: p.value })),
    })
  } catch (error) {
    console.error('[v0] Failed to fetch salary rules:', error)
    return NextResponse.json({ error: 'Failed to fetch position salaries' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const denied = await access(); if (denied) return denied
  const parsed = salaryRuleInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })

  const { siteId, positionId, positionAllowance } = parsed.data
  try {
    const [site, position] = await Promise.all([
      prisma.site.findUnique({ where: { id: siteId }, select: { id: true } }),
      prisma.masterData.findFirst({ where: { id: positionId, category: 'position' }, select: { id: true } }),
    ])
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    if (!position) return NextResponse.json({ error: 'Position not found' }, { status: 404 })

    const today = todayInJakarta()
    const wage = await prisma.salaryBase.findFirst({
      where: { siteId, effectiveDate: { lte: toDbDate(today) } },
      orderBy: { effectiveDate: 'desc' },
    })
    if (!wage) {
      return NextResponse.json(
        { error: 'Set this site\'s minimum wage in Manage Base Salary first' },
        { status: 400 },
      )
    }

    const hasCurrentRule =
      (await prisma.salaryRule.count({ where: { siteId, positionId, effectiveDate: { lte: toDbDate(today) } } })) > 0
    const effectiveDate = toDbDate(firstOfMonth(today, hasCurrentRule ? 1 : 0))

    // The wage that will apply on the rule's start date (may be a scheduled raise).
    const wageAtStart =
      (await prisma.salaryBase.findFirst({
        where: { siteId, effectiveDate: { lte: effectiveDate } },
        orderBy: { effectiveDate: 'desc' },
      })) ?? wage
    const minimumWage = Number(wageAtStart.minimumWage)

    await prisma.salaryRule.upsert({
      where: { positionId_siteId_effectiveDate: { positionId, siteId, effectiveDate } },
      create: {
        positionId,
        siteId,
        salaryBaseId: wageAtStart.id,
        minimumWage,
        positionAllowance,
        baseSalary: minimumWage + positionAllowance,
        effectiveDate,
      },
      update: {
        salaryBaseId: wageAtStart.id,
        minimumWage,
        positionAllowance,
        baseSalary: minimumWage + positionAllowance,
      },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Failed to save salary rule:', error)
    return NextResponse.json({ error: 'Failed to save position allowance' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await access(); if (denied) return denied
  const siteId = req.nextUrl.searchParams.get('siteId')
  const positionId = req.nextUrl.searchParams.get('positionId')
  if (!siteId || !positionId) return NextResponse.json({ error: 'Site and position are required' }, { status: 400 })

  try {
    await prisma.salaryRule.deleteMany({ where: { siteId, positionId } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Failed to remove salary rule:', error)
    return NextResponse.json({ error: 'Failed to remove position salary' }, { status: 500 })
  }
}
