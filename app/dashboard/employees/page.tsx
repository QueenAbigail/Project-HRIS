export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { EmployeesTable } from '@/components/employees/employees-table'
import { EmployeesHeader } from '@/components/employees/employees-header'
import { EmployeesStats } from '@/components/employees/employees-stats'
import { EmployeesSkeleton } from '@/components/skeletons/employees-skeleton'
import { format } from 'date-fns'
import { Suspense } from 'react'
import type { Employee } from '@/components/employees/employee-profile-sheet'

interface LocationStat {
  name: string
  code: string
  count: number
}

async function EmployeesContent({
  searchQuery,
}: {
  searchQuery: string
}) {
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
        userId: true
      }
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        initials: true,
        email: true,
        department: true,
        position: true,
        status: true,
        joinDate: true,
        phoneNumber: true,
        personalEmail: true,
        bpjsNumber: true,
        npwpNumber: true,
        ktpNumber: true,
        address: true,
        birthCity: true,
        birthDate: true,
        gender: true,
        religion: true,
        maritalStatus: true,
        bloodType: true,
        employeeCode: true,
        ktaNumber: true,
        ktaExpiry: true,
        certifications: true,
        site: {
          select: {
            name: true,
            code: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
  ])

  const onLeaveIds = new Set(activeLeaves.map((leave) => leave.userId))

  const employees = users.map((user) => {
    const status = onLeaveIds.has(user.id) && user.status === 'ACTIVE'
      ? 'on-leave'
      : (user.status.toLowerCase() as 'active' | 'inactive' | 'on-leave')

    const initials = user.initials ?? user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

    return {
      id: user.id,
      name: user.name,
      initials,
      email: user.email,
      department: user.department ?? '',
      position: user.position ?? '',
      status,
      joinDate: user.joinDate ? format(user.joinDate, 'MMM d, yyyy') : '',
      location: user.site ? `${user.site.company?.name || 'N/A'} - ${user.site.name}` : '',
      locationCode: user.site?.code ?? '',
      phone: user.phoneNumber ?? '',
      phoneNumber: user.phoneNumber ?? '',
      personalEmail: user.personalEmail ?? '',
      bpjsNumber: user.bpjsNumber ?? '',
      npwpNumber: user.npwpNumber ?? '',
      ktpNumber: user.ktpNumber ?? '',
      address: user.address ?? '',
      birthCity: user.birthCity ?? '',
      birthDate: user.birthDate
        ? format(user.birthDate, 'yyyy-MM-dd')
        : '',
      gender: user.gender ?? '',
      religion: user.religion ?? '',
      maritalStatus: user.maritalStatus ?? '',
      bloodType: user.bloodType ?? '',
      employeeCode: user.employeeCode ?? '',
      ktaNumber: user.ktaNumber ?? '',
      ktaExpiry: user.ktaExpiry
        ? format(user.ktaExpiry, 'yyyy-MM-dd')
        : '',
    }
  })

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

export default function EmployeesPage({
  searchParams
}: {
  searchParams: { search?: string }
}) {
  const searchQuery = searchParams.search || ''

  return (
    <Suspense fallback={<EmployeesSkeleton />}>
      <EmployeesContent searchQuery={searchQuery} />
    </Suspense>
  )
}

