import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { deductionRuleInputSchema, serializeDeductionRule } from '@/lib/deduction-rules'

type RouteContext = { params: Promise<{ id: string }> }
async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const denied = await access(); if (denied) return denied
  const { id } = await params
  const parsed = deductionRuleInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  try {
    const rule = await prisma.deductionRule.update({ where: { id }, data: parsed.data })
    return NextResponse.json(serializeDeductionRule(rule))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return NextResponse.json({ error: 'Deduction rule not found' }, { status: 404 })
      if (error.code === 'P2002') return NextResponse.json({ error: 'A rule with this name and category already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update deduction rule' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const denied = await access(); if (denied) return denied
  const { id } = await params
  try {
    const rule = await prisma.deductionRule.update({ where: { id }, data: { status: 'inactive' } })
    return NextResponse.json(serializeDeductionRule(rule))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return NextResponse.json({ error: 'Deduction rule not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to deactivate deduction rule' }, { status: 500 })
  }
}
