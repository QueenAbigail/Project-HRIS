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

type RouteContext = { params: Promise<{ id: string }> }

async function requirePayrollAccess() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canManagePayroll(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const accessError = await requirePayrollAccess()
  if (accessError) return accessError

  const { id } = await params
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
    const rule = await prisma.deductionRule.update({
      where: { id },
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
    return NextResponse.json(serializeDeductionRule(rule))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Deduction rule not found' }, { status: 404 })
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A rule with this position, site, type and risk level already exists' },
          { status: 409 },
        )
      }
    }
    console.error('[v0] Failed to update deduction rule:', error)
    return NextResponse.json({ error: 'Failed to update deduction rule' }, { status: 500 })
  }
}

// Soft delete: rules are referenced by payroll_deductions_applied, so rows are deactivated, never removed.
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const accessError = await requirePayrollAccess()
  if (accessError) return accessError

  const { id } = await params

  try {
    const rule = await prisma.deductionRule.update({
      where: { id },
      data: { status: 'inactive' },
    })
    return NextResponse.json(serializeDeductionRule(rule))
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Deduction rule not found' }, { status: 404 })
    }
    console.error('[v0] Failed to deactivate deduction rule:', error)
    return NextResponse.json({ error: 'Failed to deactivate deduction rule' }, { status: 500 })
  }
}
