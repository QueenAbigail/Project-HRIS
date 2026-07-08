import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('[v0] Fetching departments from MasterData...')
    
    // Get all departments from MasterData table
    const departments = await prisma.masterData.findMany({
      where: {
        category: 'Department',
        isActive: true,
      },
      orderBy: { value: 'asc' },
    })

    console.log('[v0] Found departments:', departments.length, departments)

    const depts = departments.map(d => ({
      value: d.value,
      label: d.value,
    }))

    return Response.json(depts)
  } catch (error) {
    console.error('[v0] Failed to fetch departments:', error)
    return Response.json({ error: 'Failed to fetch departments', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
