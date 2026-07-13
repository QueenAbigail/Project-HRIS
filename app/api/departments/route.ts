import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('[v0] Fetching departments from User table...')
    
    // Get all unique departments from users
    const users = await prisma.user.findMany({
      select: { department: true },
      distinct: ['department'],
      where: {
        department: {
          not: null,
        },
      },
      orderBy: { department: 'asc' },
    })

    console.log('[v0] Found departments:', users.length, users)

    const depts = users
      .filter(u => u.department) // Remove null values
      .map(u => ({
        value: u.department!,
        label: u.department!,
      }))

    return Response.json(depts)
  } catch (error) {
    console.error('[v0] Failed to fetch departments:', error)
    return Response.json({ error: 'Failed to fetch departments', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
