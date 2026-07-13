import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('[v0] Fetching leave types from MasterData...')
    
    // Get all allowed leave types from MasterData table
    const leaveTypes = await prisma.masterData.findMany({
      where: {
        category: 'LeaveType',
        isActive: true,
      },
      orderBy: { value: 'asc' },
    })

    console.log('[v0] Found leave types:', leaveTypes.length, leaveTypes)

    // If no types configured in MasterData, return defaults
    if (leaveTypes.length === 0) {
      console.log('[v0] No leave types in MasterData, returning defaults')
      return Response.json([
        { value: 'Izin', label: 'Cuti' },
        { value: 'Sakit', label: 'Sakit' },
        { value: 'TukarShift', label: 'Tukar Shift' },
      ])
    }

    // Map MasterData values to display labels
    const labelMap: Record<string, string> = {
      'Izin': 'Cuti',
      'Sakit': 'Sakit',
      'TukarShift': 'Tukar Shift',
    }

    const types = leaveTypes.map(type => ({
      value: type.value,
      label: labelMap[type.value] || type.value,
    }))

    return Response.json(types)
  } catch (error) {
    console.error('[v0] Failed to fetch leave types:', error)
    return Response.json({ error: 'Failed to fetch leave types', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
