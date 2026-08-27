import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('[v0] Fetching leave types from MasterData...')
    
    // Get all allowed leave types from MasterData table
    const leaveTypes = await prisma.masterData.findMany({
      where: {
        category: 'leaveType',
        isActive: true,
      },
      orderBy: { value: 'asc' },
    })

    console.log('[v0] Found leave types:', leaveTypes.length, leaveTypes)

    const types = leaveTypes.map((type) => ({
      value: type.value,
      label: type.value,
    }))

    return Response.json(types)
  } catch (error) {
    console.error('[v0] Failed to fetch leave types:', error)
    return Response.json({ error: 'Failed to fetch leave types', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
