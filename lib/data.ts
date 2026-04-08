import { 
  locations, 
  shifts, 
  employeeSchedules, 
  todayAttendance, 
  LocationId, 
  EmployeeSchedule, 
  AttendanceRecord 
} from './constants'


// Store integrations - use in components (server-side functions use getState)
import { useSchedulesStore } from '@/stores/useSchedulesStore'


// Check if an employee is scheduled to work on a given date
export function isEmployeeWorkingDay(employeeId: string, date: Date = new Date()): boolean {
  const schedule = useSchedulesStore.getState().employeeSchedules.find(s => s.employeeId === employeeId)
  if (!schedule) return false
  return schedule.workingDays.includes(date.getDay())
}

// Get employee's schedule
export function getEmployeeSchedule(employeeId: string): EmployeeSchedule | undefined {
  return useSchedulesStore.getState().employeeSchedules.find(s => s.employeeId === employeeId)
}

// Get all employees on day off for a given date
export function getEmployeesOnDayOff(date: Date = new Date()): EmployeeSchedule[] {
  const dayOfWeek = date.getDay()
  const schedules = useSchedulesStore.getState().employeeSchedules
  return schedules.filter(s => !s.workingDays.includes(dayOfWeek))
}

// Get employees scheduled to work on a given date
export function getScheduledEmployees(date: Date = new Date()): EmployeeSchedule[] {
  const dayOfWeek = date.getDay()
  const schedules = useSchedulesStore.getState().employeeSchedules
  return schedules.filter(s => s.workingDays.includes(dayOfWeek))
}

// Get day off count by location
export function getDayOffCountByLocation(date: Date = new Date()): Record<LocationId, number> {
  const dayOfWeek = date.getDay()
  const schedules = useSchedulesStore.getState().employeeSchedules
  const result: Record<LocationId, number> = {
    'HO': 0, 'PT-DT': 0, 'RM': 0, 'MB-CT': 0, 'CC-N': 0, 'IP-W': 0
  }
  
  schedules.forEach(schedule => {
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
  const state = useSchedulesStore.getState()
  return state.todayAttendance
    .filter(record => record.status === 'late')
    .map(record => {
      const schedule = state.employeeSchedules.find(s => s.employeeId === record.employeeId)
      const location = locations.find(l => l.id === record.locationId)
      const shift = state.shifts.find(s => s.id === schedule?.shiftId)
      
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

// Get employees assigned to a specific shift (working today)
export function getShiftEmployees(shiftId: string): EmployeeSchedule[] {
  const state = useSchedulesStore.getState()
  const today = new Date()
  const dayOfWeek = today.getDay()
  return state.employeeSchedules.filter(schedule => 
    schedule.shiftId === shiftId && schedule.workingDays.includes(dayOfWeek)
  )
}

// Get shift statistics for today
export interface ShiftStats {
  total: number
  present: number
  late: number
}

export function getShiftStats(shiftId: string): ShiftStats {
  const state = useSchedulesStore.getState()
  const employees = getShiftEmployees(shiftId)
  const todayAttendance = state.todayAttendance
  
  const total = employees.length
  const checkedIn = employees.map(emp => todayAttendance.find(att => att.employeeId === emp.employeeId)).filter(Boolean) as AttendanceRecord[]
  const present = checkedIn.filter(att => att.status === 'present').length
  const late = checkedIn.filter(att => att.status === 'late').length
  
  return {
    total,
    present,
    late
  }
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
  const state = useSchedulesStore.getState()
  
  return state.employeeSchedules.map(schedule => {
    const shift = state.shifts.find(s => s.id === schedule.shiftId)!
    const location = locations.find(l => l.id === schedule.locationId)!
    const attendance = state.todayAttendance.find(a => a.employeeId === schedule.employeeId)
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
