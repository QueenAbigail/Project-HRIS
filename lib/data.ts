// Centralized data layer for employee schedules, attendance, and late check-in detection

// Location definitions
export const locations = [
  { id: 'HO', name: 'Head Office', code: 'HO' },
  { id: 'PT-DT', name: 'Plaza Tower - Downtown', code: 'PT-DT' },
  { id: 'RM', name: 'Riverside Mall', code: 'RM' },
  { id: 'MB-CT', name: 'Metro Bank - Central', code: 'MB-CT' },
  { id: 'CC-N', name: 'Corporate Center - North', code: 'CC-N' },
  { id: 'IP-W', name: 'Industrial Park - West', code: 'IP-W' },
] as const

export type LocationId = typeof locations[number]['id']

// Shift definitions with scheduled times
export interface Shift {
  id: string
  name: string
  startTime: string // HH:MM format (24h)
  endTime: string
  gracePeriodMinutes: number // Minutes allowed after scheduled start before marked late
}

export const shifts: Shift[] = [
  { id: 'morning', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', gracePeriodMinutes: 10 },
  { id: 'day', name: 'Day Shift', startTime: '08:00', endTime: '16:00', gracePeriodMinutes: 10 },
  { id: 'evening', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', gracePeriodMinutes: 10 },
  { id: 'night', name: 'Night Shift', startTime: '22:00', endTime: '06:00', gracePeriodMinutes: 10 },
]

// Employee schedule assignment
// workingDays: array of day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
export interface EmployeeSchedule {
  employeeId: string
  employeeName: string
  initials: string
  shiftId: string
  locationId: LocationId
  department: string
  position: string
  workingDays: number[] // e.g., [1,2,3,4,5] for Mon-Fri
}

export const employeeSchedules: EmployeeSchedule[] = [
  // Varied schedules: some Mon-Fri, some with weekends, some rotating (different days off)
  { employeeId: 'EMP001', employeeName: 'Michael Chen', initials: 'MC', shiftId: 'morning', locationId: 'HO', department: 'Field Security', position: 'Senior Guard', workingDays: [1, 2, 3, 4, 5] },
  { employeeId: 'EMP002', employeeName: 'Sarah Williams', initials: 'SW', shiftId: 'morning', locationId: 'PT-DT', department: 'Surveillance', position: 'CCTV Operator', workingDays: [0, 1, 2, 3, 4] },
  { employeeId: 'EMP003', employeeName: 'David Rodriguez', initials: 'DR', shiftId: 'morning', locationId: 'RM', department: 'Patrol', position: 'Patrol Lead', workingDays: [2, 3, 4, 5, 6] },
  { employeeId: 'EMP004', employeeName: 'Emily Johnson', initials: 'EJ', shiftId: 'day', locationId: 'HO', department: 'Administration', position: 'HR Coordinator', workingDays: [1, 2, 3, 4, 5] },
  { employeeId: 'EMP005', employeeName: 'James Wilson', initials: 'JW', shiftId: 'evening', locationId: 'RM', department: 'Field Security', position: 'Security Guard', workingDays: [0, 1, 2, 5, 6] },
  { employeeId: 'EMP006', employeeName: 'Robert Taylor', initials: 'RT', shiftId: 'morning', locationId: 'MB-CT', department: 'Patrol', position: 'Night Patrol', workingDays: [1, 2, 3, 4, 5] },
  { employeeId: 'EMP007', employeeName: 'Jessica Brown', initials: 'JB', shiftId: 'morning', locationId: 'CC-N', department: 'Surveillance', position: 'Control Room Lead', workingDays: [0, 1, 2, 3, 4] },
  { employeeId: 'EMP008', employeeName: 'Thomas Anderson', initials: 'TA', shiftId: 'morning', locationId: 'IP-W', department: 'Field Security', position: 'Security Guard', workingDays: [1, 2, 3, 4, 5] },
  { employeeId: 'EMP009', employeeName: 'Lisa Martinez', initials: 'LM', shiftId: 'evening', locationId: 'PT-DT', department: 'Surveillance', position: 'CCTV Operator', workingDays: [2, 3, 4, 5, 6] },
  { employeeId: 'EMP010', employeeName: 'Kevin Lee', initials: 'KL', shiftId: 'night', locationId: 'RM', department: 'Field Security', position: 'Night Patrol', workingDays: [0, 1, 4, 5, 6] },
  { employeeId: 'EMP011', employeeName: 'Amanda White', initials: 'AW', shiftId: 'morning', locationId: 'HO', department: 'Administration', position: 'Payroll Specialist', workingDays: [1, 2, 3, 4, 5] },
  { employeeId: 'EMP012', employeeName: 'Daniel Harris', initials: 'DH', shiftId: 'day', locationId: 'MB-CT', department: 'VIP Protection', position: 'VIP Protection', workingDays: [1, 2, 3, 4, 5] },
  { employeeId: 'EMP013', employeeName: 'Michelle Garcia', initials: 'MG', shiftId: 'morning', locationId: 'CC-N', department: 'Field Security', position: 'Security Guard', workingDays: [0, 2, 3, 4, 5] },
  { employeeId: 'EMP014', employeeName: 'Christopher Moore', initials: 'CM', shiftId: 'evening', locationId: 'IP-W', department: 'Patrol', position: 'Mobile Patrol', workingDays: [1, 2, 3, 5, 6] },
  { employeeId: 'EMP015', employeeName: 'Jennifer Clark', initials: 'JC', shiftId: 'morning', locationId: 'PT-DT', department: 'Field Security', position: 'Senior Guard', workingDays: [0, 1, 2, 3, 6] },
]

// Attendance record with actual check-in times
export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  scheduledStart: string // HH:MM
  actualCheckIn: string | null // HH:MM or null if not checked in
  actualCheckOut: string | null // HH:MM or null if not checked out
  status: 'present' | 'late' | 'absent' | 'leave' | 'not-checked-in'
  lateMinutes: number // Minutes late (0 if on time or early)
  locationId: LocationId
}

// Today's attendance data with realistic late check-ins
export const todayAttendance: AttendanceRecord[] = [
  // Head Office (HO) - 35 total, 32 present, 2 absent, 1 not checked in
  { id: 'ATT001', employeeId: 'EMP001', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:02', actualCheckOut: '14:05', status: 'present', lateMinutes: 0, locationId: 'HO' },
  { id: 'ATT004', employeeId: 'EMP004', date: '2026-03-28', scheduledStart: '08:00', actualCheckIn: '08:00', actualCheckOut: '16:30', status: 'present', lateMinutes: 0, locationId: 'HO' },
  { id: 'ATT011', employeeId: 'EMP011', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:25', actualCheckOut: '14:15', status: 'late', lateMinutes: 15, locationId: 'HO' },

  // Plaza Tower (PT-DT) - 48 total, 42 present, 3 absent, 2 not checked in, 1 on leave
  { id: 'ATT002', employeeId: 'EMP002', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '05:58', actualCheckOut: '14:00', status: 'present', lateMinutes: 0, locationId: 'PT-DT' },
  { id: 'ATT009', employeeId: 'EMP009', date: '2026-03-28', scheduledStart: '14:00', actualCheckIn: '14:22', actualCheckOut: null, status: 'late', lateMinutes: 12, locationId: 'PT-DT' },
  { id: 'ATT015', employeeId: 'EMP015', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:35', actualCheckOut: '14:10', status: 'late', lateMinutes: 25, locationId: 'PT-DT' },

  // Riverside Mall (RM) - 52 total, 45 present, 4 absent, 3 not checked in
  { id: 'ATT003', employeeId: 'EMP003', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:45', actualCheckOut: null, status: 'late', lateMinutes: 35, locationId: 'RM' },
  { id: 'ATT005', employeeId: 'EMP005', date: '2026-03-28', scheduledStart: '14:00', actualCheckIn: null, actualCheckOut: null, status: 'absent', lateMinutes: 0, locationId: 'RM' },
  { id: 'ATT010', employeeId: 'EMP010', date: '2026-03-28', scheduledStart: '22:00', actualCheckIn: '22:18', actualCheckOut: null, status: 'late', lateMinutes: 8, locationId: 'RM' },

  // Metro Bank (MB-CT) - 28 total, 24 present, 1 absent, 2 not checked in, 1 on leave
  { id: 'ATT006', employeeId: 'EMP006', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: null, actualCheckOut: null, status: 'leave', lateMinutes: 0, locationId: 'MB-CT' },
  { id: 'ATT012', employeeId: 'EMP012', date: '2026-03-28', scheduledStart: '08:00', actualCheckIn: '08:05', actualCheckOut: '16:00', status: 'present', lateMinutes: 0, locationId: 'MB-CT' },

  // Corporate Center (CC-N) - 44 total, 38 present, 3 absent, 2 not checked in, 1 on leave
  { id: 'ATT007', employeeId: 'EMP007', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:00', actualCheckOut: '14:15', status: 'present', lateMinutes: 0, locationId: 'CC-N' },
  { id: 'ATT013', employeeId: 'EMP013', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:42', actualCheckOut: '14:20', status: 'late', lateMinutes: 32, locationId: 'CC-N' },

  // Industrial Park (IP-W) - 40 total, 35 present, 2 absent, 3 not checked in
  { id: 'ATT008', employeeId: 'EMP008', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '05:55', actualCheckOut: '14:00', status: 'present', lateMinutes: 0, locationId: 'IP-W' },
  { id: 'ATT014', employeeId: 'EMP014', date: '2026-03-28', scheduledStart: '14:00', actualCheckIn: '14:28', actualCheckOut: null, status: 'late', lateMinutes: 18, locationId: 'IP-W' },
]

// Day name helper
export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Check if an employee is scheduled to work on a given date
export function isEmployeeWorkingDay(employeeId: string, date: Date = new Date()): boolean {
  const schedule = employeeSchedules.find(s => s.employeeId === employeeId)
  if (!schedule) return false
  return schedule.workingDays.includes(date.getDay())
}

// Get employee's schedule
export function getEmployeeSchedule(employeeId: string): EmployeeSchedule | undefined {
  return employeeSchedules.find(s => s.employeeId === employeeId)
}

// Get all employees on day off for a given date
export function getEmployeesOnDayOff(date: Date = new Date()): EmployeeSchedule[] {
  const dayOfWeek = date.getDay()
  return employeeSchedules.filter(s => !s.workingDays.includes(dayOfWeek))
}

// Get employees scheduled to work on a given date
export function getScheduledEmployees(date: Date = new Date()): EmployeeSchedule[] {
  const dayOfWeek = date.getDay()
  return employeeSchedules.filter(s => s.workingDays.includes(dayOfWeek))
}

// Get day off count by location
export function getDayOffCountByLocation(date: Date = new Date()): Record<LocationId, number> {
  const dayOfWeek = date.getDay()
  const result: Record<LocationId, number> = {
    'HO': 0, 'PT-DT': 0, 'RM': 0, 'MB-CT': 0, 'CC-N': 0, 'IP-W': 0
  }
  
  employeeSchedules.forEach(schedule => {
    if (!schedule.workingDays.includes(dayOfWeek)) {
      result[schedule.locationId]++
    }
  })
  
  return result
}

// Late check-in detection utility
export function isLateCheckIn(scheduledStart: string, actualCheckIn: string | null, gracePeriodMinutes: number = 10): boolean {
  if (!actualCheckIn) return false
  
  const [scheduledHour, scheduledMin] = scheduledStart.split(':').map(Number)
  const [actualHour, actualMin] = actualCheckIn.split(':').map(Number)
  
  const scheduledMinutes = scheduledHour * 60 + scheduledMin
  const actualMinutes = actualHour * 60 + actualMin
  
  return actualMinutes > scheduledMinutes + gracePeriodMinutes
}

// Calculate late minutes
export function calculateLateMinutes(scheduledStart: string, actualCheckIn: string | null, gracePeriodMinutes: number = 10): number {
  if (!actualCheckIn) return 0
  
  const [scheduledHour, scheduledMin] = scheduledStart.split(':').map(Number)
  const [actualHour, actualMin] = actualCheckIn.split(':').map(Number)
  
  const scheduledMinutes = scheduledHour * 60 + scheduledMin
  const actualMinutes = actualHour * 60 + actualMin
  const lateBy = actualMinutes - scheduledMinutes - gracePeriodMinutes
  
  return lateBy > 0 ? lateBy : 0
}

// Get all late check-ins for today
export function getLateCheckIns(): (AttendanceRecord & { employeeName: string; initials: string; locationName: string; shiftName: string })[] {
  return todayAttendance
    .filter(record => record.status === 'late')
    .map(record => {
      const schedule = employeeSchedules.find(s => s.employeeId === record.employeeId)
      const location = locations.find(l => l.id === record.locationId)
      const shift = shifts.find(s => s.id === schedule?.shiftId)
      
      return {
        ...record,
        employeeName: schedule?.employeeName || 'Unknown',
        initials: schedule?.initials || '??',
        locationName: location?.name || 'Unknown',
        shiftName: shift?.name || 'Unknown',
      }
    })
    .sort((a, b) => b.lateMinutes - a.lateMinutes) // Sort by most late first
}

// Get attendance statistics by location
export interface LocationAttendanceStats {
  locationId: LocationId
  locationName: string
  totalStaff: number
  present: number
  absent: number
  late: number
  lateMinutesTotal: number
  notCheckedIn: number
  onLeave: number
  dayOff: number // Employees on scheduled day off
  expectedToWork: number // totalStaff - dayOff
  attendanceRate: number
}

export function getLocationAttendanceStats(): LocationAttendanceStats[] {
  // Base location data with totals
  const locationBaseData: Record<LocationId, { totalStaff: number; present: number; absent: number; notCheckedIn: number; onLeave: number }> = {
    'HO': { totalStaff: 35, present: 32, absent: 2, notCheckedIn: 1, onLeave: 0 },
    'PT-DT': { totalStaff: 48, present: 42, absent: 3, notCheckedIn: 2, onLeave: 1 },
    'RM': { totalStaff: 52, present: 45, absent: 4, notCheckedIn: 3, onLeave: 0 },
    'MB-CT': { totalStaff: 28, present: 24, absent: 1, notCheckedIn: 2, onLeave: 1 },
    'CC-N': { totalStaff: 44, present: 38, absent: 3, notCheckedIn: 2, onLeave: 1 },
    'IP-W': { totalStaff: 40, present: 35, absent: 2, notCheckedIn: 3, onLeave: 0 },
  }
  
  // Get day off counts by location
  const dayOffByLocation = getDayOffCountByLocation()

  return locations.map(location => {
    const baseData = locationBaseData[location.id]
    const locationRecords = todayAttendance.filter(r => r.locationId === location.id)
    const lateRecords = locationRecords.filter(r => r.status === 'late')
    const lateMinutesTotal = lateRecords.reduce((sum, r) => sum + r.lateMinutes, 0)
    
    // Count late from records, rest comes from base data
    const lateCount = lateRecords.length
    const dayOff = dayOffByLocation[location.id]
    const expectedToWork = baseData.totalStaff - dayOff
    
    return {
      locationId: location.id,
      locationName: location.name,
      totalStaff: baseData.totalStaff,
      present: baseData.present - lateCount, // On-time present
      absent: baseData.absent,
      late: lateCount,
      lateMinutesTotal,
      notCheckedIn: baseData.notCheckedIn,
      onLeave: baseData.onLeave,
      dayOff,
      expectedToWork,
      // Attendance rate is now based on expected workers (excluding day-off)
      attendanceRate: expectedToWork > 0 ? Math.round((baseData.present / expectedToWork) * 100) : 100,
    }
  })
}

// Get overall attendance statistics
export interface OverallAttendanceStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateCheckIns: number
  totalLateMinutes: number
  averageLateMinutes: number
  notCheckedIn: number
  onLeave: number
  dayOff: number // Employees on scheduled day off
  expectedToWork: number // Total minus day-off
  attendanceRate: number
  lateChangeFromLastWeek: number // Negative means improvement
}

export function getOverallAttendanceStats(): OverallAttendanceStats {
  const locationStats = getLocationAttendanceStats()
  const lateCheckIns = getLateCheckIns()
  
  const totalEmployees = locationStats.reduce((sum, l) => sum + l.totalStaff, 0)
  const presentToday = locationStats.reduce((sum, l) => sum + l.present + l.late, 0)
  const absentToday = locationStats.reduce((sum, l) => sum + l.absent, 0)
  const notCheckedIn = locationStats.reduce((sum, l) => sum + l.notCheckedIn, 0)
  const onLeave = locationStats.reduce((sum, l) => sum + l.onLeave, 0)
  const dayOff = locationStats.reduce((sum, l) => sum + l.dayOff, 0)
  const expectedToWork = totalEmployees - dayOff
  const totalLateMinutes = lateCheckIns.reduce((sum, r) => sum + r.lateMinutes, 0)
  
  return {
    totalEmployees,
    presentToday,
    absentToday,
    lateCheckIns: lateCheckIns.length,
    totalLateMinutes,
    averageLateMinutes: lateCheckIns.length > 0 ? Math.round(totalLateMinutes / lateCheckIns.length) : 0,
    notCheckedIn,
    onLeave,
    dayOff,
    expectedToWork,
    // Attendance rate based on expected workers (excluding day-off)
    attendanceRate: expectedToWork > 0 ? Math.round((presentToday / expectedToWork) * 100) : 100,
    lateChangeFromLastWeek: -3, // Mock: 3 fewer late check-ins than last week
  }
}

// Get employee with their schedule and attendance
export interface EmployeeWithAttendance {
  employeeId: string
  employeeName: string
  initials: string
  department: string
  position: string
  locationId: LocationId
  locationName: string
  shiftId: string
  shiftName: string
  scheduledStart: string
  scheduledEnd: string
  actualCheckIn: string | null
  actualCheckOut: string | null
  status: 'present' | 'late' | 'absent' | 'leave' | 'not-checked-in' | 'day-off'
  lateMinutes: number
  workHours: string
  workingDays: number[]
  isWorkingToday: boolean
}

export function getEmployeesWithAttendance(date: Date = new Date()): EmployeeWithAttendance[] {
  const dayOfWeek = date.getDay()
  
  return employeeSchedules.map(schedule => {
    const shift = shifts.find(s => s.id === schedule.shiftId)!
    const location = locations.find(l => l.id === schedule.locationId)!
    const attendance = todayAttendance.find(a => a.employeeId === schedule.employeeId)
    const isWorkingToday = schedule.workingDays.includes(dayOfWeek)
    
    let workHours = '--'
    if (attendance?.actualCheckIn && attendance?.actualCheckOut) {
      const [inH, inM] = attendance.actualCheckIn.split(':').map(Number)
      const [outH, outM] = attendance.actualCheckOut.split(':').map(Number)
      const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      workHours = `${hours}h ${minutes.toString().padStart(2, '0')}m`
    }
    
    // Determine status: if not working today, mark as day-off
    let status: EmployeeWithAttendance['status'] = attendance?.status || 'not-checked-in'
    if (!isWorkingToday) {
      status = 'day-off'
    }
    
    return {
      employeeId: schedule.employeeId,
      employeeName: schedule.employeeName,
      initials: schedule.initials,
      department: schedule.department,
      position: schedule.position,
      locationId: schedule.locationId,
      locationName: location.name,
      shiftId: schedule.shiftId,
      shiftName: shift.name,
      scheduledStart: shift.startTime,
      scheduledEnd: shift.endTime,
      actualCheckIn: attendance?.actualCheckIn || null,
      actualCheckOut: attendance?.actualCheckOut || null,
      status,
      lateMinutes: attendance?.lateMinutes || 0,
      workHours,
      workingDays: schedule.workingDays,
      isWorkingToday,
    }
  })
}

// Format time for display (24h to 12h)
export function formatTime(time: string | null): string {
  if (!time) return '--:--'
  
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
}

// Get late check-in severity
export function getLateCheckInSeverity(lateMinutes: number): 'minor' | 'moderate' | 'severe' {
  if (lateMinutes <= 15) return 'minor'
  if (lateMinutes <= 30) return 'moderate'
  return 'severe'
}
