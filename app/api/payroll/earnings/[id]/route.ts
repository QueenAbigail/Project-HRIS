import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { todayInJakarta, toDbDate } from '@/lib/salary-base'
import { buildEarningGroupKey, payrollEarningStatusSchema } from '@/lib/payroll-earnings'

async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await access()
  if (denied) return denied

  const parsed = payrollEarningStatusSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid status' }, { status: 400 })
  }

  const { id } = await params
  try {
    const todayDate = toDbDate(todayInJakarta())

    const found = await prisma.$transaction(
      async (tx) => {
        const anchor = await tx.payrollEarning.findUnique({ where: { id } })
        if (!anchor) return false

        const targetKey = buildEarningGroupKey(anchor.companyId, anchor.siteId, anchor.positionId, anchor.name)
        const siblings = (
          await tx.payrollEarning.findMany({
            where: {
              companyId: anchor.companyId,
              siteId: anchor.siteId,
              positionId: anchor.positionId,
            },
            select: { id: true, companyId: true, siteId: true, positionId: true, name: true },
          })
        ).filter((row) => buildEarningGroupKey(row.companyId, row.siteId, row.positionId, row.name) === targetKey)

        await tx.payrollEarning.updateMany({
          where: { id: { in: siblings.map((s) => s.id) } },
          data: {
            status: parsed.data.status,
            effectiveTo: parsed.data.status === 'inactive' ? todayDate : null,
          },
        })

        return true
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )

    if (!found) return NextResponse.json({ error: 'Earning rule not found' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json(
        { error: 'Concurrent update detected. Please try again.' },
        { status: 409 },
      )
    }
    console.error('[v0] Failed to update earning status:', error)
    return NextResponse.json({ error: 'Failed to update earning status' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await access()
  if (denied) return denied

  const { id } = await params
  try {
    const todayDate = toDbDate(todayInJakarta())
    const deleted = await prisma.payrollEarning.deleteMany({
      where: {
        id,
        effectiveFrom: { gt: todayDate },
      },
    })

    if (deleted.count === 0) {
      const existing = await prisma.payrollEarning.findUnique({ where: { id }, select: { id: true } })
      if (!existing) return NextResponse.json({ error: 'Earning rule not found' }, { status: 404 })
      return NextResponse.json({ error: 'Only a scheduled change can be cancelled' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Failed to cancel scheduled earning:', error)
    return NextResponse.json({ error: 'Failed to cancel scheduled change' }, { status: 500 })
  }
}
