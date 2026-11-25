import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { fromDbDate, todayInJakarta, toDbDate } from '@/lib/salary-base'
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
    const anchor = await prisma.payrollEarning.findUnique({ where: { id } })
    if (!anchor) return NextResponse.json({ error: 'Earning rule not found' }, { status: 404 })

    const targetKey = buildEarningGroupKey(anchor.companyId, anchor.siteId, anchor.positionId, anchor.name)
    const siblings = (
      await prisma.payrollEarning.findMany({
        where: {
          companyId: anchor.companyId,
          siteId: anchor.siteId,
          positionId: anchor.positionId,
        },
        select: { id: true, companyId: true, siteId: true, positionId: true, name: true },
      })
    ).filter((row) => buildEarningGroupKey(row.companyId, row.siteId, row.positionId, row.name) === targetKey)

    const todayDate = toDbDate(todayInJakarta())
    await prisma.payrollEarning.updateMany({
      where: { id: { in: siblings.map((s) => s.id) } },
      data: {
        status: parsed.data.status,
        effectiveTo: parsed.data.status === 'inactive' ? todayDate : null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Failed to update earning status:', error)
    return NextResponse.json({ error: 'Failed to update earning status' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await access()
  if (denied) return denied

  const { id } = await params
  try {
    const row = await prisma.payrollEarning.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Earning rule not found' }, { status: 404 })

    if (fromDbDate(row.effectiveFrom) <= todayInJakarta()) {
      return NextResponse.json({ error: 'Only a scheduled change can be cancelled' }, { status: 400 })
    }

    await prisma.payrollEarning.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Failed to cancel scheduled earning:', error)
    return NextResponse.json({ error: 'Failed to cancel scheduled change' }, { status: 500 })
  }
}
