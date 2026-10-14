import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canManagePayroll } from '@/lib/authorization'
import {
  deductionRuleInputSchema,
  serializeDeductionRule,
  toDate,
  validateScope,
} from '@/lib/deduction-rules'

async function requirePayrollAccess() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManagePayroll(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const accessError = await requirePayrollAccess()
  if (accessError) return accessError

  try {
    const [rules, positions, sites] = await Promise.all([
      prisma.deductionRule.findMany({
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      }),
      prisma.masterData.findMany({
        where: { category: 'position', isActive: true },
        select: { value: true },
        orderBy: { value: 'asc' },
      }),
      prisma.site.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      rules: rules.map(serializeDeductionRule),
      positions: positions.map((position) => position.value),
      sites,
    })
  } catch (error) {
    console.error('[v0] Failed to fetch deduction rules:', error)
    return NextResponse.json({ error: 'Failed to fetch deduction rules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const accessError = await requirePayrollAccess()
  if (accessError) return accessError

  const body = await req.json().catch(() => null)
  const parsed = deductionRuleInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }
  const input = parsed.data

  const scopeError = await validateScope(input.positionId, input.siteId)
  if (scopeError) return NextResponse.json({ error: scopeError }, { status: 400 })

  try {
    const rule = await prisma.deductionRule.create({
      data: {
        positionId: input.positionId,
        siteId: input.siteId,
        name: input.name,
        type: input.type,
        deductionType: input.deductionType,
        value: input.value,
        riskLevel: input.riskLevel ?? null,
        effectiveDate: toDate(input.effectiveDate),
        endDate: input.endDate ? toDate(input.endDate) : null,
        status: input.status,
      },
    })
    return NextResponse.json(serializeDeductionRule(rule), { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A rule with this position, site, type and risk level already exists' },
        { status: 409 },
      )
    }
    console.error('[v0] Failed to create deduction rule:', error)
    return NextResponse.json({ error: 'Failed to create deduction rule' }, { status: 500 })
  }
}
