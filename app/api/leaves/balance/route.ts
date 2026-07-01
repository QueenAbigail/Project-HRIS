import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const leaveTypeDefaults: Record<string, { label: string; total: number }> = {
  Izin: { label: 'Izin', total: 12 },
  Sakit: { label: 'Sakit', total: 12 },
  TukarShift: { label: 'Tukar Shift', total: 0 },
}

export async function GET() {
  try {
    const leaveTypeKeys = Object.keys(leaveTypeDefaults)
    const balances = []

    for (const leaveType of leaveTypeKeys) {
      const approved = await prisma.leave.count({
        where: {
          leaveType,
          status: 'Approved',
        },
      })

      const total = leaveTypeDefaults[leaveType].total
      const label = leaveTypeDefaults[leaveType].label

      balances.push({
        type: label,
        used: approved,
        total: total > 0 ? total : approved + 5, // fallback if total is 0
      })
    }

    return NextResponse.json(balances.filter(b => b.total > 0))
  } catch (error) {
    console.error('[v0] Error fetching leave balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
