import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import { overtimeRuleInputSchema, serializeOvertimeRule, toOvertimeRuleData } from '@/lib/overtime-rules'

async function access() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return canManagePayroll(user.role) ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function GET() {
  const denied = await access(); if (denied) return denied
  try {
    const rules = await prisma.overtimeRule.findMany({ orderBy: [{ type: 'asc' }, { hour: 'asc' }] })
    return NextResponse.json({ rules: rules.map(serializeOvertimeRule) })
  } catch (error) {
    console.error('[v0] Failed to fetch overtime rules:', error)
    return NextResponse.json({ error: 'Failed to fetch overtime rules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const denied = await access(); if (denied) return denied
  const parsed = overtimeRuleInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  try {
    const rule = await prisma.overtimeRule.create({ data: toOvertimeRuleData(parsed.data) })
    return NextResponse.json(serializeOvertimeRule(rule), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return NextResponse.json({ error: 'A multiplier for this hour already exists in this overtime type' }, { status: 409 })
    console.error('[v0] Failed to create overtime rule:', error)
    return NextResponse.json({ error: 'Failed to create overtime rule' }, { status: 500 })
  }
}
