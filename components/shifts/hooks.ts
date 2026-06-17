import { useSchedulesStore } from '@/stores/useSchedulesStore'
import type { EmployeeWithAttendance } from '@/lib/data'

export function useEmployeesWithAttendance(date: Date = new Date()) {
  const dayOfWeek = date.getDay()
  
  // Get all the required data from store with separate selectors
  const employeeSchedules = useSchedulesStore((state) => state.employeeSchedules)
  const shifts = useSchedulesStore((state) => state.shifts)
  const todayAttendance = useSchedulesStore((state) => state.todayAttendance)
  
  // Transform data outside of Zustand selector to avoid infinite loops
  const employees = employeeSchedules.map((schedule) => {
    const shift = shifts.find((s) => s.id === schedule.shiftId)
    const attendance = todayAttendance.find((a) => a.employeeId === schedule.employeeId)
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
    
    let status: EmployeeWithAttendance['status'] = attendance?.status || 'not-checked-in'
    if (!isWorkingToday) {
      status = 'day-off'
    }
    
    // Only require shift - location comes from database
    if (!shift) return null
    
    return {
      employeeId: schedule.employeeId,
      employeeName: schedule.employeeName,
      initials: schedule.initials,
      department: schedule.department,
      position: schedule.position,
      locationId: schedule.locationId,
      locationName: schedule.locationName, // Use from database instead of constants
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
  }).filter(Boolean) as EmployeeWithAttendance[]
  
  return employees
}

