import { prisma } from './prisma'
import { Decimal } from '@prisma/client/runtime/library'

interface PayrollCalculationInput {
  userId: string
  payrollPeriodId: string
  adjustmentAmount?: number
  adjustmentReason?: string
}

interface PayrollCalculationResult {
  userId: string
  payrollPeriodId: string
  baseSalary: number
  positionAllowance: number
  overtimeEarnings: number
  bonusAmount: number
  totalDeductions: number
  grossSalary: number
  netPay: number
  deductionBreakdown: {
    type: string
    name: string
    amount: number
  }[]
}

/**
 * Calculate payroll for a single employee
 * This implements the calculation logic from the PAYROLL_SYSTEM_DOCUMENTATION.md
 */
export async function calculatePayrollForEmployee(
  input: PayrollCalculationInput
): Promise<PayrollCalculationResult> {
  const { userId, payrollPeriodId, adjustmentAmount = 0, adjustmentReason } =
    input

  // Fetch employee
  const employee = await prisma.user.findUnique({
    where: { id: userId },
    select: { position: true, siteId: true }
  })

  if (!employee || !employee.position) {
    throw new Error(`Employee not found or no position assigned: ${userId}`)
  }

  // Fetch payroll period
  const payrollPeriod = await prisma.payrollPeriod.findUnique({
    where: { id: payrollPeriodId }
  })

  if (!payrollPeriod) {
    throw new Error(`Payroll period not found: ${payrollPeriodId}`)
  }

  // Fetch salary rule
  const salaryRule = await prisma.salaryRule.findUnique({
    where: {
      positionId_siteId: {
        positionId: employee.position,
        siteId: employee.siteId,
      }
    }
  })

  if (!salaryRule) {
    throw new Error(
      `Salary rule not found for position ${employee.position} at site ${employee.siteId}`
    )
  }

  // === STEP 1: Base Salary Components ===
  const baseSalary = parseFloat(salaryRule.baseSalary.toString())
  const positionAllowance = parseFloat(
    salaryRule.positionAllowance.toString()
  )

  // === STEP 2: Calculate Overtime Earnings ===
  const overtimeHours = await prisma.payrollOvertimeHours.findMany({
    where: {
      userId,
      payrollPeriodId,
      status: 'approved'
    },
    include: {
      overtimeRule: true
    }
  })

  let overtimeEarnings = 0
  for (const ot of overtimeHours) {
    // Hourly rate = baseSalary / 176 hours (22 working days × 8 hours/day)
    const hourlyRate = baseSalary / 176
    const amount =
      parseFloat(ot.hours.toString()) *
      hourlyRate *
      parseFloat(ot.overtimeRule.multiplier.toString())
    overtimeEarnings += amount
  }

  // === STEP 3: Add Bonuses ===
  const bonuses = await prisma.payrollBonus.findMany({
    where: {
      userId,
      payrollPeriodId,
      status: 'approved'
    }
  })

  const bonusAmount = bonuses.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0)

  // === STEP 4: Calculate Gross Salary ===
  const grossSalary =
    baseSalary + positionAllowance + overtimeEarnings + bonusAmount

  // === STEP 5: Calculate Deductions ===
  const deductionRules = await prisma.deductionRule.findMany({
    where: {
      positionId: employee.position,
      siteId: employee.siteId,
      status: 'active',
      isApplicableToAll: true
    }
  })

  const deductionBreakdown: {
    type: string
    name: string
    amount: number
  }[] = []
  let totalDeductions = 0

  for (const rule of deductionRules) {
    let deductionAmount = 0

    if (rule.deductionType === 'percentage') {
      // Calculate percentage on gross salary (not including position allowance in some cases)
      // Based on documentation: percentage applied to gross salary
      deductionAmount =
        (grossSalary * parseFloat(rule.value.toString())) / 100
    } else if (rule.deductionType === 'fixed_amount') {
      deductionAmount = parseFloat(rule.value.toString())
    }

    deductionBreakdown.push({
      type: rule.type,
      name: rule.name,
      amount: deductionAmount
    })

    totalDeductions += deductionAmount

    // Store in payroll_deductions_applied table
    await prisma.payrollDeductionsApplied.upsert({
      where: {
        id: `${userId}-${payrollPeriodId}-${rule.id}`
      },
      update: {
        baseSalary: new Decimal(grossSalary),
        deductionType: rule.type,
        deductionName: rule.name,
        calculationType: rule.deductionType,
        baseValue: new Decimal(rule.value.toString()),
        calculatedAmount: new Decimal(deductionAmount.toString())
      },
      create: {
        userId,
        payrollPeriodId,
        deductionRuleId: rule.id,
        baseSalary: new Decimal(grossSalary),
        deductionType: rule.type,
        deductionName: rule.name,
        calculationType: rule.deductionType,
        baseValue: new Decimal(rule.value.toString()),
        calculatedAmount: new Decimal(deductionAmount.toString())
      }
    })
  }

  // === STEP 6: Calculate Net Pay ===
  const adjustedTotalDeductions = totalDeductions + adjustmentAmount
  const netPay = grossSalary - adjustedTotalDeductions

  // === STEP 7: Store Calculation ===
  const calculation = await prisma.payrollCalculation.upsert({
    where: {
      userId_payrollPeriodId: {
        userId,
        payrollPeriodId
      }
    },
    update: {
      baseSalary: new Decimal(baseSalary),
      positionAllowance: new Decimal(positionAllowance),
      overtimeEarnings: new Decimal(overtimeEarnings),
      bonusAmount: new Decimal(bonusAmount),
      totalDeductions: new Decimal(adjustedTotalDeductions),
      grossSalary: new Decimal(grossSalary),
      netPay: new Decimal(netPay),
      status: 'calculated',
      adjustmentAmount: adjustmentAmount
        ? new Decimal(adjustmentAmount)
        : null,
      adjustmentReason: adjustmentReason || null,
      calculatedAt: new Date()
    },
    create: {
      userId,
      payrollPeriodId,
      baseSalary: new Decimal(baseSalary),
      positionAllowance: new Decimal(positionAllowance),
      overtimeEarnings: new Decimal(overtimeEarnings),
      bonusAmount: new Decimal(bonusAmount),
      totalDeductions: new Decimal(adjustedTotalDeductions),
      grossSalary: new Decimal(grossSalary),
      netPay: new Decimal(netPay),
      status: 'calculated',
      adjustmentAmount: adjustmentAmount
        ? new Decimal(adjustmentAmount)
        : null,
      adjustmentReason: adjustmentReason || null,
      calculatedAt: new Date()
    }
  })

  return {
    userId,
    payrollPeriodId,
    baseSalary,
    positionAllowance,
    overtimeEarnings,
    bonusAmount,
    totalDeductions: adjustedTotalDeductions,
    grossSalary,
    netPay,
    deductionBreakdown
  }
}

/**
 * Calculate payroll for all employees in a period
 */
export async function calculatePayrollForPeriod(
  payrollPeriodId: string
): Promise<{
  calculated: number
  failed: number
  results: PayrollCalculationResult[]
}> {
  // Get all active employees
  const employees = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      position: { not: null }
    },
    select: { id: true }
  })

  const results: PayrollCalculationResult[] = []
  let failedCount = 0

  for (const employee of employees) {
    try {
      const result = await calculatePayrollForEmployee({
        userId: employee.id,
        payrollPeriodId
      })
      results.push(result)
    } catch (error) {
      console.error(`Failed to calculate payroll for ${employee.id}:`, error)
      failedCount++
    }
  }

  return {
    calculated: results.length,
    failed: failedCount,
    results
  }
}

/**
 * Approve payroll calculations for payment
 */
export async function approvePayrollForPayment(
  payrollPeriodId: string,
  approvedBy: string
): Promise<{ updated: number }> {
  const result = await prisma.payrollCalculation.updateMany({
    where: {
      payrollPeriodId,
      status: 'calculated'
    },
    data: {
      status: 'approved_for_payment',
      approvedAt: new Date()
    }
  })

  // Update period status
  await prisma.payrollPeriod.update({
    where: { id: payrollPeriodId },
    data: {
      status: 'approved',
      approvedBy,
      approvedAt: new Date()
    }
  })

  return { updated: result.count }
}
