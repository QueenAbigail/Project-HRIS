import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { fromDbDate, todayInJakarta } from '@/lib/salary-base'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManagePayroll(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  try {
    const row = await prisma.salaryBase.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Minimum wage record not found' }, { status: 404 })
    if (fromDbDate(row.effectiveDate) <= todayInJakarta()) {
      return NextResponse.json({ error: 'Only a scheduled change can be cancelled' }, { status: 400 })
    }
    await prisma.salaryBase.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Failed to cancel scheduled minimum wage:', error)
    return NextResponse.json({ error: 'Failed to cancel scheduled change' }, { status: 500 })
  }
}
