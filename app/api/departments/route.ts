import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all departments from MasterData table
    const departments = await prisma.masterData.findMany({
      where: {
        category: 'Department',
        isActive: true,
      },
      orderBy: { value: 'asc' },
    })

    const depts = departments.map(d => ({
      value: d.value,
      label: d.value,
    }))

    return Response.json(depts)
  } catch (error) {
    console.error('[v0] Failed to fetch departments:', error)
    return Response.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}
