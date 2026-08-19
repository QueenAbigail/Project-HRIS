export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
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
  
  // Get current user to check if CLIENT role
  const currentUser = await getCurrentUser()
  const isClient = currentUser?.role === 'CLIENT'
  const companyFilter = isClient ? { companyId: currentUser?.companyId } : {}

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
    prisma.user.count({ where: companyFilter }),
    prisma.user.count({ where: { ...companyFilter, status: 'ACTIVE' } }),
    prisma.user.count({ 
      where: { 
        ...companyFilter,
        OR: [
          { status: 'INACTIVE' },
          { status: 'SUSPENDED' }
        ]
      } 
    }),
    prisma.leave.count({
      where: {
        status: 'APPROVED',
        ...(isClient ? { user: { companyId: currentUser?.companyId } } : {}),
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
      where: isClient ? { companyId: currentUser?.companyId } : {},
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
        ...(isClient ? { user: { companyId: currentUser?.companyId } } : {}),
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
      where: companyFilter,
      select: {
        id: true,
        name: true,
        initials: true,
        email: true,
        avatar: true,
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
        employmentStatus: true,
        role: true,
        allowMobileAttendance: true,
        allowWebAppAccess: true,
        bankName: true,
        accountHolder: true,
        accountNumber: true,
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
      avatar: user.avatar ?? undefined,
      department: user.department ?? '',
      position: user.position ?? '',
      status,
      joinDate: user.joinDate ? format(user.joinDate, 'MMM d, yyyy') : '',
      joinDateValue: user.joinDate ? format(user.joinDate, 'yyyy-MM-dd') : '',
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
      employmentStatus: user.employmentStatus ?? '',
      certifications: Array.isArray(user.certifications) ? user.certifications : [],
      role: user.role ?? 'STAFF',
      userStatus: user.status ?? 'ACTIVE',
      allowMobileAttendance: user.allowMobileAttendance,
      allowWebAppAccess: user.allowWebAppAccess,
      bankName: user.bankName ?? '',
      accountHolder: user.accountHolder ?? '',
      accountNumber: user.accountNumber ?? '',
    }
  })

  const locationStats: LocationStat[] = sites.map((site) => ({
    name: site.name,
    code: site.code,
    count: site._count.users,
  }))

  return (
    <div className="space-y-6">
      <EmployeesHeader isClient={isClient} />
      <EmployeesStats 
        counts={{
          total: totalUsers,
          active: activeUsers,
          onLeave: onLeaveCount,
          inactive: inactiveUsers
        }}
        locationStats={locationStats} 
      />
      <EmployeesTable users={employees} isClient={isClient} />
    </div>
  )
}

export default async function EmployeesPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search || ''

  return (
    <Suspense fallback={<EmployeesSkeleton />}>
      <EmployeesContent searchQuery={searchQuery} />
    </Suspense>
  )
}

