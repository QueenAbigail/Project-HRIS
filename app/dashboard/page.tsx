/* eslint-disable react-hooks/error-boundaries -- this try/catch handles server data loading failures. */
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { AttendanceChart } from '@/components/dashboard/attendance-chart'
import { LocationAttendance } from '@/components/dashboard/location-attendance'
import { LateCheckIns } from '@/components/dashboard/late-checkins'
import { UpcomingLeaves } from '@/components/dashboard/upcoming-leaves'
import { tallyAttendance, computeAttendanceRate, resolveAttendanceStatus } from '@/lib/attendance-utils'
import Link from 'next/link'
import { getBusinessDateBounds } from '@/lib/timezone'

export default async function DashboardPage() {
  try {
    // Get current user to determine data filtering
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Unable to Load Dashboard</h1>
            <p className="text-gray-600 mb-4">Could not retrieve your user information. Please log in again.</p>
            <Link href="/login" className="text-blue-600 hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      )
    }

    const { todayStart, todayEnd, weekAgo, monthStart, monthEnd } = getBusinessDateBounds()
    
    // Determine if user is a CLIENT (can see all sites in their company)
    const isClient = currentUser.role === 'CLIENT'
    const companyFilter = isClient ? { companyId: currentUser.companyId } : {}
    const [
      companies,
      sites,
      users,
      todayAttendances,
      weekAttendances,
      recentLeaves,
      assignments,
      approvedLeavesThisMonth
    ] = await prisma.$transaction([
    isClient ? prisma.company.findMany({ where: { id: currentUser.companyId }, select: { id: true, name: true } }) : prisma.company.findMany({ select: { id: true, name: true } }),
    isClient ? prisma.site.findMany({ where: { companyId: currentUser.companyId }, select: { id: true, name: true, code: true, companyId: true } }) : prisma.site.findMany({ select: { id: true, name: true, code: true, companyId: true } }),
    prisma.user.findMany({ where: companyFilter, select: { id: true, site: { select: { id: true } } } }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: todayStart,
          lt: todayEnd
        },
        ...(isClient ? { user: { companyId: currentUser.companyId } } : {})
      },
      select: {
        id: true,
        userId: true,
        status: true,
        lateMinutes: true,
        scheduledStart: true,
        actualCheckIn: true,
        locationId: true,
        user: { select: { name: true, initials: true, companyId: true } },
        location: { select: { name: true } },
        shift: { select: { name: true } },
      }
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: weekAgo,
          lt: todayEnd
        },
        ...(isClient ? { user: { companyId: currentUser.companyId } } : {})
      },
      select: {
        date: true,
        status: true,
        lateMinutes: true,
        actualCheckIn: true,
      }
    }),
    prisma.leave.findMany({
      where: {
        status: {
          in: ['Pending', 'Approved']
        },
        endDate: { gte: todayStart },
        startDate: { lt: monthEnd },
        ...(isClient ? { user: { companyId: currentUser.companyId } } : {})
      },
      orderBy: {
        startDate: 'asc'
      },
      take: 8,
      select: {
        id: true,
        leaveType: true,
        startDate: true,
        endDate: true,
        user: { select: { name: true, siteId: true } },
        bkoAssignments: { select: { id: true } },
      }
    }),
    // Query schedules for today to calculate day offs
    prisma.schedule.findMany({
      where: {
        scheduleDate: {
          gte: todayStart,
          lt: todayEnd
        },
        employee: isClient ? { site: { companyId: currentUser.companyId } } : {}
      },
      select: {
        employee: { select: { id: true } },
      }
    }),
    // Count approved leaves this month
    prisma.leave.count({
      where: {
        status: 'Approved',
        startDate: {
          gte: monthStart,
          lt: monthEnd
        },
        ...(isClient ? { user: { companyId: currentUser.companyId } } : {})
      }
    })
  ]);

  // Extract company name for CLIENT users from the fetched companies
  const companyNameForDisplay = isClient && companies.length > 0 ? companies[0].name : currentUser.site?.company?.name || 'your company'

  // usersBySite
  const usersBySite: Record<string, number> = {};
  users.forEach((user) => {
    if (user.site?.id) {
      usersBySite[user.site.id] = (usersBySite[user.site.id] || 0) + 1;
    }
  });

  // dayOff - count employees without schedule today
  const dayOffBySite: Record<string, number> = {};
  const scheduledEmployeeIds = new Set(assignments.map(s => s.employee.id));
  
  users.forEach((user) => {
    if (user.site?.id && !scheduledEmployeeIds.has(user.id)) {
      dayOffBySite[user.site.id] = (dayOffBySite[user.site.id] || 0) + 1;
    }
  });

  // helper formatTime
  const formatTime = (dt: Date | string | null): string => {
    if (!dt) return '--:--';
    const date = dt instanceof Date ? dt : new Date(dt);
    if (isNaN(date.getTime())) return '--:--';
    const h = date.getHours();
    const m = date.getMinutes();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // lateCheckIns
  const lateCheckIns = todayAttendances
    .filter((a) => a.lateMinutes > 0)
    .map((a) => ({
      id: a.id,
      employeeId: a.userId,
      status: a.status,
      lateMinutes: a.lateMinutes,
      scheduledStart: formatTime(a.scheduledStart),
      actualCheckIn: formatTime(a.actualCheckIn),
      employeeName: a.user?.name ?? 'Unknown',
      initials: a.user?.initials ?? '??',
      locationName: a.location?.name ?? 'Unknown',
      shiftName: a.shift?.name ?? 'Unknown',
    }))
    .sort((a, b) => b.lateMinutes - a.lateMinutes as any);

  // locationStats grouped by company
  const locationStatsByCompany = companies.map((company) => {
    // Get all sites for this company
    const companySites = sites.filter((s) => s.companyId === company.id);
    
    // Get aggregated stats for all sites in this company
    let companyTotalStaff = 0;
    let companyDayOff = 0;
    let companyPresent = 0;
    let companyAbsent = 0;
    let companyLate = 0;
    let companyLateMinutesTotal = 0;
    let companyNotCheckedIn = 0;
    let companyOnLeave = 0;

    // Calculate site-level stats
    const siteStats = companySites.map((site) => {
      const siteAtt = todayAttendances.filter((a) => a.locationId === site.id);
      // Canonical tally via the shared single-source-of-truth helper
      const siteTally = tallyAttendance(siteAtt);
      const lateCount = siteTally.late;
      const lateMinutesTotal = siteTally.totalLateMinutes;
      const totalStaff = usersBySite[site.id] || 0;
      const dayOff = dayOffBySite[site.id] || 0;
      const expectedToWork = Math.max(0, totalStaff - dayOff);
      const present = siteTally.present;
      const absent = siteTally.absent;
      const notCheckedIn = siteTally.notCheckedIn;
      const onLeave = recentLeaves.filter((l) => l.user?.siteId === site.id).length;
      const attendanceRate = computeAttendanceRate(present, lateCount, expectedToWork);

      // Accumulate for company totals
      companyTotalStaff += totalStaff;
      companyDayOff += dayOff;
      companyPresent += present;
      companyAbsent += absent;
      companyLate += lateCount;
      companyLateMinutesTotal += lateMinutesTotal;
      companyNotCheckedIn += notCheckedIn;
      companyOnLeave += onLeave;

      return {
        siteId: site.id,
        locationId: site.code || site.id.slice(0, 6).toUpperCase(),
        locationName: site.name,
        totalStaff,
        present,
        absent,
        late: lateCount,
        lateMinutesTotal,
        notCheckedIn,
        onLeave,
        dayOff,
        expectedToWork,
        attendanceRate,
      };
    });

    const unknownAttendance = todayAttendances.filter(
      (attendance) => !attendance.locationId && attendance.user?.companyId === company.id
    )
    if (unknownAttendance.length > 0) {
      const unknownTally = tallyAttendance(unknownAttendance)
      const unknownLateMinutes = unknownTally.totalLateMinutes
      companyPresent += unknownTally.present
      companyAbsent += unknownTally.absent
      companyLate += unknownTally.late
      companyLateMinutesTotal += unknownLateMinutes
      companyNotCheckedIn += unknownTally.notCheckedIn
      companyOnLeave += unknownTally.onLeave

      siteStats.push({
        siteId: null,
        locationId: 'UNKNOWN',
        locationName: 'Unknown',
        totalStaff: 0,
        present: unknownTally.present,
        absent: unknownTally.absent,
        late: unknownTally.late,
        lateMinutesTotal: unknownLateMinutes,
        notCheckedIn: unknownTally.notCheckedIn,
        onLeave: unknownTally.onLeave,
        dayOff: 0,
        expectedToWork: 0,
        attendanceRate: 0,
      })
    }

    // Calculate company-level attendance rate
    const companyExpectedToWork = Math.max(0, companyTotalStaff - companyDayOff);
    const companyAttendanceRate = computeAttendanceRate(companyPresent, companyLate, companyExpectedToWork);

    return {
      companyId: company.id,
      companyName: company.name,
      totalStaff: companyTotalStaff,
      present: companyPresent,
      absent: companyAbsent,
      late: companyLate,
      lateMinutesTotal: companyLateMinutesTotal,
      notCheckedIn: companyNotCheckedIn,
      onLeave: companyOnLeave,
      dayOff: companyDayOff,
      expectedToWork: companyExpectedToWork,
      attendanceRate: companyAttendanceRate,
      sites: siteStats,
    };
  });

  // Ensure all date objects in locationStatsByCompany are serializable
  const serializedLocationStatsByCompany = locationStatsByCompany.map((company) => ({
    ...company,
    sites: company.sites.map((site) => ({
      siteId: site.siteId,
      locationId: site.locationId,
      locationName: site.locationName,
      totalStaff: site.totalStaff,
      present: site.present,
      absent: site.absent,
      late: site.late,
      lateMinutesTotal: site.lateMinutesTotal,
      notCheckedIn: site.notCheckedIn,
      onLeave: site.onLeave,
      dayOff: site.dayOff,
      expectedToWork: site.expectedToWork,
      attendanceRate: site.attendanceRate,
    }))
  }));

  const locationStats = serializedLocationStatsByCompany.flatMap((c) => c.sites);

  // overallStats
  const overallDayOff = Object.values(dayOffBySite).reduce((sum, count) => sum + (count as number), 0);
  // Canonical overall tally via the shared single-source-of-truth helper
  const overallTally = tallyAttendance(todayAttendances);
  const overallPresent = overallTally.present;
  const overallAbsent = overallTally.absent;
  const overallLate = overallTally.late;
  const overallNotCheckedIn = overallTally.notCheckedIn;
  const overallTotalLateMinutes = overallTally.totalLateMinutes;
  const overallAverageLate = overallTally.averageLateMinutes;
  const overallExpected = users.length - overallDayOff;
  const overallRate = computeAttendanceRate(overallPresent, overallLate, overallExpected);
  const overallStats = {
    totalEmployees: users.length,
    presentToday: overallPresent,
    absentToday: overallAbsent,
    lateCheckIns: overallLate,
    totalLateMinutes: overallTotalLateMinutes,
    averageLateMinutes: overallAverageLate,
    notCheckedIn: overallNotCheckedIn,
    onLeave: recentLeaves.length,
    dayOff: overallDayOff,
    expectedToWork: overallExpected,
    attendanceRate: overallRate,
    activeLocations: sites.length,
    approvedLeavesThisMonth: approvedLeavesThisMonth,
  };

  // Build chart labels from the business timezone instead of server-local weekday names.
  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekAgo)
    date.setUTCDate(date.getUTCDate() + index)
    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Jakarta' }).format(date),
    }
  })
  const weekCounts: Record<string, { present: number; absent: number; late: number }> = {}
  chartDays.forEach(({ key }) => {
    weekCounts[key] = { present: 0, absent: 0, late: 0 }
  })
  weekAttendances.forEach((a) => {
    const dateKey = new Date(a.date).toISOString().slice(0, 10)
    if (weekCounts[dateKey]) {
      const status = resolveAttendanceStatus(a)
      if (status === 'PRESENT') weekCounts[dateKey].present += 1
      else if (status === 'LATE') weekCounts[dateKey].late += 1
      else weekCounts[dateKey].absent += 1
    }
  })
  const chartData = chartDays.map(({ key, label }) => ({
    date: label,
    present: weekCounts[key].present,
    absent: weekCounts[key].absent,
    late: weekCounts[key].late,
  }))

  // Serialize late check-ins to avoid Date serialization errors
  const serializedLateCheckIns = lateCheckIns.map(item => ({
    ...item,
    // Already strings from formatTime function, no conversion needed
  }));



    const upcomingLeaves = recentLeaves.map((leave) => ({
      name: leave.user?.name ?? 'Unknown',
      type: leave.leaveType,
      startDate: leave.startDate.toISOString(),
      endDate: leave.endDate.toISOString(),
      days: Math.max(1, Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / 86400000) + 1),
    }))

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your security team {isClient ? `at ${companyNameForDisplay}.` : 'across all locations.'}
          </p>
        </div>

        <StatsCards stats={overallStats} />

        {/* Location-based Attendance Overview */}
        <LocationAttendance locationData={serializedLocationStatsByCompany} companyName={companyNameForDisplay} isClient={isClient} />

        <div className="grid gap-6 lg:grid-cols-2">
          <AttendanceChart chartData={chartData} />
          <div className="space-y-6">
            <LateCheckIns lateCheckIns={serializedLateCheckIns} />
            <UpcomingLeaves leaves={upcomingLeaves} />
          </div>
        </div>


      </div>
    )
  } catch (error) {
    console.error('[v0] Dashboard page error:', error instanceof Error ? error.message : String(error))
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-2">An error occurred while loading the dashboard.</p>
          <p className="text-gray-600 mb-4">
            Please refresh the page and try again. If the problem continues, contact your administrator.
          </p>
          <Link href="/" className="text-blue-600 hover:underline block mt-4">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }
}
