import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all unique leave types from the database
    const leaves = await prisma.leave.findMany({
      select: { leaveType: true },
      distinct: ['leaveType'],
      orderBy: { leaveType: 'asc' },
    })

    // Map database values to display labels
    const leaveTypeMap: Record<string, string> = {
      'Izin': 'Cuti',
      'Sakit': 'Sakit',
      'Darurat': 'Darurat',
      'Melahirkan': 'Melahirkan',
      'TukarShift': 'Tukar Shift',
    }

    const types = leaves.map(leave => ({
      value: leave.leaveType,
      label: leaveTypeMap[leave.leaveType] || leave.leaveType,
    }))

    // Always include all possible types, even if no records exist
    const allTypes = [
      { value: 'Izin', label: 'Cuti' },
      { value: 'Sakit', label: 'Sakit' },
      { value: 'Darurat', label: 'Darurat' },
      { value: 'Melahirkan', label: 'Melahirkan' },
      { value: 'TukarShift', label: 'Tukar Shift' },
    ]

    return Response.json(allTypes)
  } catch (error) {
    console.error('[v0] Failed to fetch leave types:', error)
    return Response.json({ error: 'Failed to fetch leave types' }, { status: 500 })
  }
}
