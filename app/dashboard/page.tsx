import { prisma } from '@/lib/prisma'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { AttendanceChart } from '@/components/dashboard/attendance-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { UpcomingShifts } from '@/components/dashboard/upcoming-shifts'
import { LeaveRequests } from '@/components/dashboard/leave-requests'
import { PayrollSummary } from '@/components/dashboard/payroll-summary'
import { LocationAttendance } from '@/components/dashboard/location-attendance'
import { LateCheckIns } from '@/components/dashboard/late-checkins'
import type { Attendance, EmployeeShiftAssignment, Leave, Shift, Site, User } from '@prisma/client'

export default async function DashboardPage() {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    sites,
    shifts,
    users,
    todayAttendances,
    weekAttendances,
    recentLeaves,
    assignments
  ] = await Promise.all([
    prisma.site.findMany(),
    prisma.shift.findMany(),
    prisma.user.findMany({ include: { site: true } }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: todayStart,
          lt: todayEnd
        }
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
        }
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
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 8,
      include: {
        requester: {
          include: {
            site: true
          }
        }
      }
    }),
    prisma.employeeShiftAssignment.findMany({
      include: {
        user: true,
        shift: true,
        site: true
      }
    })
  ]);

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

  // locationStats
  const locationStats = sites.map((site) => {
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

  // leaveRequests
  const leaveRequests = recentLeaves.map((l) => ({
    id: l.id,
    employee: l.requester?.name ?? 'Unknown',
    initials: l.requester?.initials ?? '',
    type: l.type,
    dates: `${l.startDate.toLocaleDateString('id-ID')} - ${l.endDate.toLocaleDateString('id-ID')}`,
    status: l.status.toLowerCase(),
  }));

  // upcomingShifts
  const todayAssignments = assignments.filter((ass) => {
    try {
      const wd = JSON.parse(ass.workingDays as string);
      return Array.isArray(wd) && wd.includes(todayDay);
    } catch {
      return false;
    }
  }).slice(0, 6).map((ass) => {
    const att = todayAttendances.find((a) => a.userId === ass.userId);
    const status = att?.status?.toLowerCase() || 'not-checked-in';
    const isLate = status === 'late';
    const lateMinutes = att?.lateMinutes || 0;
    return {
      id: ass.userId,
      employee: ass.user?.name ?? '',
      initials: ass.user?.initials ?? '',
      location: ass.site?.name ?? '',
      time: `${formatTime(ass.shift?.startTime)} - ${formatTime(ass.shift?.endTime)}`,
      type: ass.shift?.name ?? '',
      status,
      isLate,
      lateMinutes,
    };
  });

  // recentActivities
  const activities = [
    // late
    ...lateCheckIns.slice(0, 3).map((record, index) => ({
      id: `late-${record.id}`,
      type: 'late-checkin' as const,
      message: `Late arrival: ${record.employeeName}`,
      detail: `+${record.lateMinutes} min at ${record.locationName}`,
      time: `${(index + 1) * 10} min ago`,
      icon: 'AlertTriangle',
      lateMinutes: record.lateMinutes,
    })),
    // check-ins
    ...todayAttendances.slice(0, 3).reverse().map((a, index) => ({
      id: `checkin-${a.id}`,
      type: 'check-in' as const,
      message: `${a.user?.name ?? 'Employee'} clocked in at ${a.location?.name ?? 'site'}`,
      time: `${index + 2} min ago`,
      icon: 'Clock',
    })),
    // leaves
    ...recentLeaves.slice(0, 2).map((l, index) => ({
      id: `leave-${l.id}`,
      type: 'leave-request' as const,
      message: `Leave requested by ${l.requester?.name ?? 'employee'}`,
      time: `${index + 4} hours ago`,
      icon: 'FileText',
    })),
  ].slice(0, 8);

  // payrollData
  const totalUsersForPay = users.length;
  const payrollData = totalUsersForPay > 0 ? [
    { label: 'Base Salary', amount: totalUsersForPay * 1000, percentage: 71 },
    { label: 'Overtime', amount: overallLate * 50, percentage: 14 },
    { label: 'Allowances', amount: totalUsersForPay * 100, percentage: 10 },
    { label: 'Bonuses', amount: 0, percentage: 5 },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your security team across all locations.
        </p>
      </div>

      <StatsCards stats={overallStats} />

      {/* Location-based Attendance Overview */}
      <LocationAttendance locationData={locationStats} />

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <AttendanceChart chartData={chartData} />
        </div>
        <div className="lg:col-span-3">
          <LateCheckIns lateCheckIns={lateCheckIns} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <UpcomingShifts data={todayAssignments} />
        <LeaveRequests data={leaveRequests} />
        <PayrollSummary data={payrollData} />
        <RecentActivity activities={activities} />
      </div>
    </div>
  )
}
