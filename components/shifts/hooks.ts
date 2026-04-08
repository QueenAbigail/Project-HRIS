import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { locations } from '@/lib/constants'
import type { EmployeeWithAttendance } from '@/lib/data'

export function useEmployeesWithAttendance(date: Date = new Date()) {
  return useSchedulesStore(state => {
    const dayOfWeek = date.getDay()
    
    return state.employeeSchedules.map(schedule => {
      const shift = state.shifts.find(s => s.id === schedule.shiftId)
      const location = locations.find(l => l.id === schedule.locationId)
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
      
      let status: EmployeeWithAttendance['status'] = attendance?.status || 'not-checked-in'
      if (!isWorkingToday) {
        status = 'day-off'
      }
      
      if (!shift || !location) return null
      
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
    }).filter(Boolean) as EmployeeWithAttendance[]
  })
}

