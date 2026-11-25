import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { firstOfMonth, todayInJakarta, toDbDate } from '@/lib/salary-base'
import {
  buildEarningGroupKey,
  payrollEarningCreateSchema,
  payrollEarningUpdateSchema,
  summarizeEarningsForCompany,
} from '@/lib/payroll-earnings'

async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET() {
  const denied = await access()
  if (denied) return denied

  try {
    const today = todayInJakarta()
    const [companies, positions, earnings] = await Promise.all([
      prisma.company.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          sites: {
            orderBy: { name: 'asc' },
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.masterData.findMany({
        where: { category: 'position', isActive: true },
        orderBy: { value: 'asc' },
        select: { id: true, value: true },
      }),
      prisma.payrollEarning.findMany({
        include: {
          site: { select: { id: true, name: true, code: true } },
          position: { select: { id: true, value: true } },
        },
      }),
    ])

    const byCompany = new Map<string, typeof earnings>()
    for (const row of earnings) {
      const list = byCompany.get(row.companyId) ?? []
      list.push(row)
      byCompany.set(row.companyId, list)
    }

    return NextResponse.json({
      today,
      companies: companies.map((company) => ({
        companyId: company.id,
        companyName: company.name,
        sites: company.sites,
        rows: summarizeEarningsForCompany(byCompany.get(company.id) ?? [], today),
      })),
      positions: positions.map((p) => ({ id: p.id, name: p.value })),
    })
  } catch (error) {
    console.error('[v0] Failed to fetch payroll earnings:', error)
    return NextResponse.json({ error: 'Failed to fetch payroll earnings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const denied = await access()
  if (denied) return denied

  const parsed = payrollEarningCreateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const companyId = parsed.data.companyId
  const siteId = parsed.data.siteId ? parsed.data.siteId : null
  const positionId = parsed.data.positionId ? parsed.data.positionId : null
  const name = parsed.data.name.trim()
  const { calculationType, amount, isTaxable } = parsed.data

  try {
    const [company, site, position] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId }, select: { id: true } }),
      siteId ? prisma.site.findUnique({ where: { id: siteId }, select: { id: true, companyId: true } }) : null,
      positionId
        ? prisma.masterData.findFirst({ where: { id: positionId, category: 'position' }, select: { id: true } })
        : null,
    ])

    if (!company) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    if (siteId && !site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    if (site && site.companyId !== companyId) {
      return NextResponse.json({ error: 'Selected site does not belong to this client' }, { status: 400 })
    }
    if (positionId && !position) return NextResponse.json({ error: 'Position not found' }, { status: 404 })

    const today = todayInJakarta()
    const targetKey = buildEarningGroupKey(companyId, siteId, positionId, name)
    const effectiveFrom = toDbDate(firstOfMonth(today, 0))

    const created = await prisma.$transaction(
      async (tx) => {
        const existingForCompany = await tx.payrollEarning.findMany({
          where: { companyId, siteId, positionId },
        })

        const duplicate = existingForCompany.find(
          (row) => buildEarningGroupKey(row.companyId, row.siteId, row.positionId, row.name) === targetKey,
        )
        if (duplicate) return null

        return tx.payrollEarning.create({
          data: {
            companyId,
            siteId,
            positionId,
            name,
            calculationType,
            amount,
            isTaxable,
            effectiveFrom,
            status: 'active',
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )

    if (!created) {
      return NextResponse.json(
        { error: 'An earning rule with this name and scope already exists. Edit the existing rule instead.' },
        { status: 409 },
      )
    }

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2002' || error.code === 'P2034')
    ) {
      return NextResponse.json(
        { error: 'An earning rule with this name and scope already exists. Edit the existing rule instead.' },
        { status: 409 },
      )
    }
    console.error('[v0] Failed to create payroll earning:', error)
    return NextResponse.json({ error: 'Failed to save earning rule' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const denied = await access()
  if (denied) return denied

  const parsed = payrollEarningUpdateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { groupId, calculationType, amount, isTaxable } = parsed.data

  try {
    const today = todayInJakarta()
    const todayDate = toDbDate(today)

    const result = await prisma.$transaction(
      async (tx) => {
        const anchor = await tx.payrollEarning.findUnique({ where: { id: groupId } })
        if (!anchor) return { status: 'not_found' as const }

        const targetKey = buildEarningGroupKey(anchor.companyId, anchor.siteId, anchor.positionId, anchor.name)
        const siblings = (
          await tx.payrollEarning.findMany({
            where: {
              companyId: anchor.companyId,
              siteId: anchor.siteId,
              positionId: anchor.positionId,
            },
          })
        ).filter((row) => buildEarningGroupKey(row.companyId, row.siteId, row.positionId, row.name) === targetKey)

        if (anchor.status === 'inactive' || siblings.some((row) => row.status === 'inactive')) {
          return { status: 'inactive' as const }
        }

        const hasCurrent = siblings.some((row) => row.effectiveFrom.getTime() <= todayDate.getTime())
        const effectiveFrom = toDbDate(firstOfMonth(today, hasCurrent ? 1 : 0))
        const existingAtDate = siblings.find((row) => row.effectiveFrom.getTime() === effectiveFrom.getTime())

        if (existingAtDate) {
          await tx.payrollEarning.update({
            where: { id: existingAtDate.id },
            data: {
              calculationType,
              amount,
              isTaxable,
              status: 'active',
              effectiveTo: null,
            },
          })
        } else {
          await tx.payrollEarning.create({
            data: {
              companyId: anchor.companyId,
              siteId: anchor.siteId,
              positionId: anchor.positionId,
              name: anchor.name,
              calculationType,
              amount,
              isTaxable,
              effectiveFrom,
              status: 'active',
            },
          })
        }

        return { status: 'ok' as const }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )

    if (result.status === 'not_found') {
      return NextResponse.json({ error: 'Earning rule not found' }, { status: 404 })
    }
    if (result.status === 'inactive') {
      return NextResponse.json(
        { error: 'Reactivate this earning rule before editing it' },
        { status: 400 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2002' || error.code === 'P2034')
    ) {
      return NextResponse.json(
        { error: 'Concurrent update detected. Please try saving again.' },
        { status: 409 },
      )
    }
    console.error('[v0] Failed to update payroll earning:', error)
    return NextResponse.json({ error: 'Failed to update earning rule' }, { status: 500 })
  }
}
