import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all sites
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })

    // Fetch all employees with their codes and names
    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        employeeCode: true,
      },
      where: {
        // Only active employees
        status: 'ACTIVE',
      },
      orderBy: { name: 'asc' },
    })

    // Format employees response
    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      name: emp.name || 'Unknown',
      code: emp.employeeCode || 'N/A',
    }))

    return NextResponse.json({
      sites,
      employees: formattedEmployees,
    })
  } catch (error) {
    console.error('[v0] Error fetching employees and sites:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
