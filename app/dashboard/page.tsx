export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { AttendanceChart } from '@/components/dashboard/attendance-chart'
import { LocationAttendance } from '@/components/dashboard/location-attendance'
import { LateCheckIns } from '@/components/dashboard/late-checkins'
import { UpcomingLeaves } from '@/components/dashboard/upcoming-leaves'
import type { Attendance, EmployeeShiftAssignment, Leave, Shift, Site, User } from '@prisma/client'

export default async function DashboardPage() {
  // Get current user to determine data filtering
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return <div>Unable to load dashboard</div>
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Month start and end for leave count
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Determine if user is a CLIENT (can see all sites in their company)
  const isClient = currentUser.role === 'CLIENT'
  const companyFilter = isClient ? { companyId: currentUser.companyId } : {}
  const companyName = currentUser.site?.company?.name || 'your company'

  const [
    companies,
    sites,
    shifts,
    users,
    todayAttendances,
    weekAttendances,
    recentLeaves,
    assignments,
    approvedLeavesThisMonth
  ] = await Promise.all([
    isClient ? prisma.company.findMany({ where: { id: currentUser.companyId } }) : prisma.company.findMany(),
    isClient ? prisma.site.findMany({ where: { companyId: currentUser.companyId }, include: { company: true } }) : prisma.site.findMany({ include: { company: true } }),
    prisma.shift.findMany(),
    prisma.user.findMany({ where: companyFilter, include: { site: true } }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: todayStart,
          lt: todayEnd
        },
        ...(isClient ? { user: { companyId: currentUser.companyId } } : {})
      },
      include: {
        user: true,
        location: true,
        shift: true
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
      include: {
        user: true,
        location: true,
        shift: true
      }
    }),
    prisma.leave.findMany({
      where: {
        status: {
          in: ['PENDING', 'APPROVED']
        },
        ...(isClient ? { user: { companyId: currentUser.companyId } } : {})
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 8,
      include: {
        user: {
          include: {
            site: true
          }
        },
        bkoAssignments: true
      }
    }),
    prisma.employeeShiftAssignment.findMany({
      where: isClient ? { site: { companyId: currentUser.companyId } } : {},
      include: {
        user: true,
        shift: true,
        site: true
      }
    }),
    // Count approved leaves this month
    prisma.leave.count({
      where: {
        status: 'APPROVED',
        startDate: {
          gte: monthStart,
          lte: monthEnd
        },
        ...(isClient ? { user: { companyId: currentUser.companyId } } : {})
      }
    })
  ]);

  // Extract company name for CLIENT users from the fetched companies
  const companyNameForDisplay = isClient && companies.length > 0 ? companies[0].name : currentUser.site?.company?.name || 'your company'

  const todayDay = today.getDay();

  // usersBySite
  const usersBySite: Record<string, number> = {};
  users.forEach((user) => {
    if (user.site?.id) {
      usersBySite[user.site.id] = (usersBySite[user.site.id] || 0) + 1;
    }
  });

  // dayOff
  const dayOffBySite: Record<string, number> = {};
  assignments.forEach((ass) => {
    try {
      const workingDays = JSON.parse(ass.workingDays as string);
      if (!Array.isArray(workingDays) || !workingDays.includes(todayDay)) {
        dayOffBySite[ass.site.id] = (dayOffBySite[ass.site.id] || 0) + 1;
      }
    } catch (e) {
      // invalid JSON, count as day off
      dayOffBySite[ass.site.id] = (dayOffBySite[ass.site.id] || 0) + 1;
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
      const lateR = siteAtt.filter((a) => a.status === 'LATE');
      const lateCount = lateR.length;
      const lateMinutesTotal = lateR.reduce((sum, a) => sum + a.lateMinutes, 0);
      const totalStaff = usersBySite[site.id] || 0;
      const dayOff = dayOffBySite[site.id] || 0;
      const expectedToWork = Math.max(0, totalStaff - dayOff);
      const present = siteAtt.filter((a) => a.status === 'PRESENT').length;
      const absent = siteAtt.filter((a) => a.status === 'ABSENT').length;
      const notCheckedIn = siteAtt.filter((a) => a.status === 'NOT_CHECKED_IN').length;
      const onLeave = recentLeaves.filter((l) => l.requester?.siteId === site.id).length;
      const attendanceRate = expectedToWork > 0 ? Math.round(((present + lateCount) / expectedToWork) * 100) : 100;

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

    // Calculate company-level attendance rate
    const companyExpectedToWork = Math.max(0, companyTotalStaff - companyDayOff);
    const companyAttendanceRate = companyExpectedToWork > 0 ? Math.round(((companyPresent + companyLate) / companyExpectedToWork) * 100) : 100;

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

  const locationStats = locationStatsByCompany.flatMap((c) => c.sites);

  // overallStats
  const overallDayOff = Object.values(dayOffBySite).reduce((sum, count) => sum + (count as number), 0);
  const overallPresent = todayAttendances.filter((a) => a.status === 'PRESENT').length;
  const overallAbsent = todayAttendances.filter((a) => a.status === 'ABSENT').length;
  const overallLate = todayAttendances.filter((a) => a.status === 'LATE').length;
  const overallNotCheckedIn = todayAttendances.filter((a) => a.status === 'NOT_CHECKED_IN').length;
  const overallTotalLateMinutes = lateCheckIns.reduce((sum, l) => sum + l.lateMinutes, 0);
  const overallAverageLate = lateCheckIns.length > 0 ? Math.round(overallTotalLateMinutes / lateCheckIns.length) : 0;
  const overallExpected = users.length - overallDayOff;
  const overallRate = overallExpected > 0 ? Math.round(overallPresent / overallExpected * 100) : 100;
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
    lateChangeFromLastWeek: 0, // TODO historical
  };

  // chartData
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekCounts: Record<string, { present: number; absent: number; late: number }> = {};
  days.forEach((dayShort, index) => {
    weekCounts[dayShort] = { present: 0, absent: 0, late: 0 };
  });
  weekAttendances.forEach((a) => {
    const dayNum = new Date(a.date).getDay();
    const dayShort = days[dayNum];
    if (weekCounts[dayShort]) {
      if (a.status === 'PRESENT') weekCounts[dayShort].present += 1;
      else if (a.status === 'LATE') weekCounts[dayShort].late += 1;
      else weekCounts[dayShort].absent += 1;
    }
  });
  const chartData = days.map((d) => ({
    date: d,
    present: weekCounts[d].present,
    absent: weekCounts[d].absent,
    late: weekCounts[d].late,
  }));



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
      <LocationAttendance locationData={locationStatsByCompany} companyName={companyNameForDisplay} isClient={isClient} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceChart chartData={chartData} />
        <div className="space-y-6">
          <LateCheckIns lateCheckIns={lateCheckIns} />
          <UpcomingLeaves />
        </div>
      </div>


    </div>
  )
}
