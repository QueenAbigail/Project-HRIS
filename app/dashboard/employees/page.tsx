import { prisma } from '@/lib/prisma'
import { EmployeesTable } from '@/components/employees/employees-table'
import { EmployeesHeader } from '@/components/employees/employees-header'
import { EmployeesStats } from '@/components/employees/employees-stats'

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

  // Fetch all stats in parallel
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    onLeaveCount,
    sites
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
              lte: new Date()
            }
          },
          {
            endDate: {
              gte: new Date()
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
    })
  ])

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
      <EmployeesTable searchQuery={searchQuery} />
    </div>
  )
}

