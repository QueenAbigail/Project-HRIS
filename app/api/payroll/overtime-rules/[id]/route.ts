import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { overtimeRuleInputSchema, serializeOvertimeRule, toOvertimeRuleData } from '@/lib/overtime-rules'

type RouteContext = { params: Promise<{ id: string }> }

async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const denied = await access(); if (denied) return denied
  const { id } = await params
  const parsed = overtimeRuleInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  try {
    const rule = await prisma.overtimeRule.update({ where: { id }, data: toOvertimeRuleData(parsed.data) })
    return NextResponse.json(serializeOvertimeRule(rule))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return NextResponse.json({ error: 'Overtime rule not found' }, { status: 404 })
      if (error.code === 'P2002') return NextResponse.json({ error: 'A multiplier for this hour already exists in this overtime type' }, { status: 409 })
    }
    console.error('[v0] Failed to update overtime rule:', error)
    return NextResponse.json({ error: 'Failed to update overtime rule' }, { status: 500 })
  }
}

// Rules already used by recorded overtime hours are deactivated so payroll history stays traceable;
// unused rules are removed.
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const denied = await access(); if (denied) return denied
  const { id } = await params
  try {
    const usage = await prisma.payrollOvertimeHours.count({ where: { overtimeRuleId: id } })
    if (usage > 0) {
      const rule = await prisma.overtimeRule.update({ where: { id }, data: { status: 'inactive' } })
      return NextResponse.json({ deleted: false, rule: serializeOvertimeRule(rule) })
    }
    await prisma.overtimeRule.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return NextResponse.json({ error: 'Overtime rule not found' }, { status: 404 })
    console.error('[v0] Failed to delete overtime rule:', error)
    return NextResponse.json({ error: 'Failed to delete overtime rule' }, { status: 500 })
  }
}
