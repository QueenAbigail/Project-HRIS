import { create } from 'zustand'
import type { StateCreator } from 'zustand'
// Jalur 1: Narik data dari gudang baru
import { 
  Shift, 
  LocationId, 
  EmployeeSchedule, 
  AttendanceRecord,
  shifts as initialShifts,
  employeeSchedules as initialEmployeeSchedules,
  locations,
  todayAttendance as initialTodayAttendance
} from '@/lib/constants'

// Jalur 2: Narik fungsi hitungan dari file lama
import { 
  calculateLateMinutes,
  formatTime 
} from '@/lib/data'
import { toast } from 'sonner'

// Types
export interface SchedulesState {
  // Core data
  shifts: Shift[]
  employeeSchedules: EmployeeSchedule[]
  todayAttendance: AttendanceRecord[]
  
  // Actions
  addShift: (newShift: Omit<Shift, 'id'>) => void
  updateShift: (shiftId: string, updates: Partial<Shift>) => void
  deleteShift: (shiftId: string) => void
  assignEmployeeShift: (employeeId: string, shiftId: string, locationId: LocationId, workingDays: number[]) => void
  updateEmployeeWorkingDays: (employeeId: string, workingDays: number[]) => void
  swapEmployees: (employeeAId: string, employeeBId: string, autoAdjustAttendance: boolean) => void
  resetToDefaults: () => void
  initializeShifts: (shiftsData: Shift[]) => void
  initializeEmployeeSchedules: (schedulesData: EmployeeSchedule[]) => void
}

// Initial state from lib/data.ts
const initialState = {
  shifts: initialShifts,
  employeeSchedules: initialEmployeeSchedules,
  todayAttendance: initialTodayAttendance,
}

// Create store without persistence (shifts come from DB, not localStorage)
export const useSchedulesStore = create<SchedulesState>()(
  (set, get) => ({
      ...initialState,

      addShift: (newShift) => {
        const id = `shift_${Date.now()}`
        set((state) => ({
          shifts: [...state.shifts, { id, ...newShift }]
        }))
        toast.success('Shift created successfully')
      },

      updateShift: (shiftId, updates) => {
        set((state) => ({
          shifts: state.shifts.map(shift => 
            shift.id === shiftId ? { ...shift, ...updates } : shift
          )
        }))
        toast.success('Shift updated successfully')
      },

      deleteShift: (shiftId) => {
        const { shifts, employeeSchedules } = get()
        // Prevent delete if assigned
        const isAssigned = employeeSchedules.some(s => s.shiftId === shiftId)
        if (isAssigned) {
          toast.error('Cannot delete shift with assigned employees')
          return
        }
        set((state) => ({
          shifts: state.shifts.filter(shift => shift.id !== shiftId)
        }))
        toast.success('Shift deleted successfully')
      },

      assignEmployeeShift: (employeeId, shiftId, locationId, workingDays) => {
        set((state) => ({
          employeeSchedules: state.employeeSchedules.map(schedule => 
            schedule.employeeId === employeeId 
              ? { ...schedule, shiftId, locationId, workingDays }
              : schedule
          )
        }))
        toast.success(`Employee assigned to ${shiftId} at ${locationId}`)
      },

      updateEmployeeWorkingDays: (employeeId, workingDays) => {
        set((state) => ({
          employeeSchedules: state.employeeSchedules.map(schedule => 
            schedule.employeeId === employeeId 
              ? { ...schedule, workingDays }
              : schedule
          )
        }))
        toast.success('Working days updated')
      },

      swapEmployees: (employeeAId, employeeBId, autoAdjustAttendance) => {
        const { employeeSchedules, todayAttendance } = get()
        
        // Swap schedules
        const scheduleA = employeeSchedules.find(s => s.employeeId === employeeAId)
        const scheduleB = employeeSchedules.find(s => s.employeeId === employeeBId)
        
        if (!scheduleA || !scheduleB) {
          toast.error('Employee not found')
          return
        }

        set((state) => ({
          employeeSchedules: state.employeeSchedules.map(schedule => {
            if (schedule.employeeId === employeeAId) return { ...schedule, ...scheduleB, employeeId: scheduleA.employeeId }
            if (schedule.employeeId === employeeBId) return { ...schedule, ...scheduleA, employeeId: scheduleB.employeeId }
            return schedule
          })
        }))

        // Auto-adjust attendance if enabled
        if (autoAdjustAttendance) {
          const attendanceA = todayAttendance.find(a => a.employeeId === employeeAId)
          const attendanceB = todayAttendance.find(a => a.employeeId === employeeBId)
          
          if (attendanceA && attendanceB) {
            set((state) => ({
              todayAttendance: state.todayAttendance.map(record => {
                if (record.employeeId === employeeAId) {
                  return { ...record, employeeId: employeeBId, locationId: scheduleB.locationId }
                }
                if (record.employeeId === employeeBId) {
                  return { ...record, employeeId: employeeAId, locationId: scheduleA.locationId }
                }
                return record
              })
            }))
          }
        }

        toast.success('Employees swapped successfully')
      },

      resetToDefaults: () => {
        set(initialState)
        toast.message('Reset to default schedules')
      },

      initializeShifts: (shiftsData) => {
        set({ shifts: shiftsData })
      },

      initializeEmployeeSchedules: (schedulesData) => {
        set({ employeeSchedules: schedulesData })
      }
    })
  )
)
}

