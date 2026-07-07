import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active users as employees
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        defaultSiteId: true,
      },
      where: {
        // Exclude the current user if needed, or add other filters
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Format for the dropdown
    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: emp.name,
      email: emp.email,
      defaultSite: emp.defaultSiteId,
      displayText: `${emp.employeeCode} - ${emp.name}`,
    }))

    return NextResponse.json(formattedEmployees)
  } catch (error) {
    console.error('[v0] Failed to fetch employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}
