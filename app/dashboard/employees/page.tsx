import { prisma } from '@/lib/prisma'
import { EmployeesTable } from '@/components/employees/employees-table'
import { EmployeesHeader } from '@/components/employees/employees-header'
import { EmployeesStats } from '@/components/employees/employees-stats'
import { format } from 'date-fns'
import type { Employee } from '@/components/employees/employee-profile-sheet'

interface LocationStat {
  name: string
  code: string
  count: number
}

export default async function EmployeesPage({
  searchParams
}: {
  searchParams: { search?: string }
}) {
  const searchQuery = searchParams.search || ''
  const today = new Date()

  // Fetch all stats and data in parallel
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    onLeaveCount,
    sites,
    activeLeaves,
    users
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ 
      where: { 
        OR: [
          { status: 'INACTIVE' },
          { status: 'SUSPENDED' }
        ]
      } 
    }),
    prisma.leave.count({
      where: {
        status: 'APPROVED',
        AND: [
          {
            startDate: {
              lte: today
            }
          },
          {
            endDate: {
              gte: today
            }
          }
        ]
      }
    }),
    prisma.site.findMany({
      include: {
        _count: {
          select: {
            users: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.leave.findMany({
      where: {
        status: 'APPROVED',
        AND: [
          {
            startDate: {
              lte: today
            }
          },
          {
            endDate: {
              gte: today
            }
          }
        ]
      },
      select: {
        requesterId: true
      }
    }),
    prisma.user.findMany({
      include: {
        site: true
      }
    })
  ])

  const onLeaveIds = new Set(activeLeaves.map((leave) => leave.requesterId))

  const employees: Employee[] = users.map((user) => {
    const nameParts = user.name.trim().split(/\s+/)
    const initials = nameParts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
    
    const status = onLeaveIds.has(user.id) && user.status === 'ACTIVE' 
      ? 'on-leave' 
      : user.status.toLowerCase() as 'active' | 'inactive' | 'on-leave'
    
    const joinDate = (user as any).joinDate 
      ? format((user as any).joinDate, 'MMM dd, yyyy')
      : format(user.createdAt, 'MMM dd, yyyy')
    
    return {
      id: user.employeeCode ?? `EMP${user.id.slice(-4).toUpperCase()}`,
      name: user.name,
      initials,
      email: user.email,
      department: user.department ?? 'N/A',
      position: user.position ?? 'N/A',
      status,
      joinDate,
      location: user.site?.name ?? 'Unassigned',
      locationCode: user.site?.code ?? '',
    }
  }).sort((a, b) => a.name.localeCompare(b.name))

  const locationStats: LocationStat[] = sites.map((site) => ({
    name: site.name,
    code: site.code,
    count: site._count.users,
  }))

  return (
    <div className="space-y-6">
      <EmployeesHeader />
      <EmployeesStats 
        counts={{
          total: totalUsers,
          active: activeUsers,
          onLeave: onLeaveCount,
          inactive: inactiveUsers
        }}
        locationStats={locationStats} 
      />
      <EmployeesTable users={employees} />
    </div>
  )
}

