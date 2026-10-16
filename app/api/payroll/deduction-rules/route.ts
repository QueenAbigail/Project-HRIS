import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { deductionRuleInputSchema, serializeDeductionRule } from '@/lib/deduction-rules'

async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET() {
  const denied = await access(); if (denied) return denied
  try {
    const rules = await prisma.deductionRule.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ rules: rules.map(serializeDeductionRule) })
  } catch (error) {
    console.error('[v0] Failed to fetch deduction rules:', error)
    return NextResponse.json({ error: 'Failed to fetch deduction rules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const denied = await access(); if (denied) return denied
  const parsed = deductionRuleInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  try {
    const rule = await prisma.deductionRule.create({ data: parsed.data })
    return NextResponse.json(serializeDeductionRule(rule), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'A rule with this name and category already exists' }, { status: 409 })
    console.error('[v0] Failed to create deduction rule:', error)
    return NextResponse.json({ error: 'Failed to create deduction rule' }, { status: 500 })
  }
}
