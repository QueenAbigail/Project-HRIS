import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all unique departments from employees
    const departments = await prisma.employee.findMany({
      select: { department: true },
      distinct: ['department'],
      where: { department: { not: null } },
      orderBy: { department: 'asc' },
    })

    const depts = departments
      .filter(d => d.department) // Remove null values
      .map(d => ({
        value: d.department!.toLowerCase().replace(/\s+/g, '-'),
        label: d.department,
      }))

    return Response.json(depts)
  } catch (error) {
    console.error('[v0] Failed to fetch departments:', error)
    return Response.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}
