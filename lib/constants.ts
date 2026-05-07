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

// GPS Coordinates for attendance
export interface GpsCoordinates {
  latitude: number
  longitude: number
  accuracy: number // in meters
  address?: string // reverse geocoded address
}

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
  // GPS and photo data for mobile attendance
  checkInGps?: GpsCoordinates | null
  checkOutGps?: GpsCoordinates | null
  checkInPhotoUrl?: string | null
  checkOutPhotoUrl?: string | null
}

// Today's attendance data with realistic late check-ins and GPS/photo data
export const todayAttendance: AttendanceRecord[] = [
  // Head Office (HO) - 35 total, 32 present, 2 absent, 1 not checked in
  { 
    id: 'ATT001', employeeId: 'EMP001', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:02', actualCheckOut: '14:05', status: 'present', lateMinutes: 0, locationId: 'HO',
    checkInGps: { latitude: -6.2088, longitude: 106.8456, accuracy: 5, address: 'Head Office, Jl. Sudirman No. 1, Jakarta' },
    checkOutGps: { latitude: -6.2088, longitude: 106.8456, accuracy: 8, address: 'Head Office, Jl. Sudirman No. 1, Jakarta' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },
  { 
    id: 'ATT004', employeeId: 'EMP004', date: '2026-03-28', scheduledStart: '08:00', actualCheckIn: '08:00', actualCheckOut: '16:30', status: 'present', lateMinutes: 0, locationId: 'HO',
    checkInGps: { latitude: -6.2090, longitude: 106.8458, accuracy: 3, address: 'Head Office, Jl. Sudirman No. 1, Jakarta' },
    checkOutGps: { latitude: -6.2089, longitude: 106.8457, accuracy: 4, address: 'Head Office, Jl. Sudirman No. 1, Jakarta' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },
  { 
    id: 'ATT011', employeeId: 'EMP011', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:25', actualCheckOut: '14:15', status: 'late', lateMinutes: 15, locationId: 'HO',
    checkInGps: { latitude: -6.2092, longitude: 106.8460, accuracy: 10, address: 'Near Head Office, Jl. Sudirman, Jakarta' },
    checkOutGps: { latitude: -6.2088, longitude: 106.8456, accuracy: 6, address: 'Head Office, Jl. Sudirman No. 1, Jakarta' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },

  // Plaza Tower (PT-DT) - 48 total, 42 present, 3 absent, 2 not checked in, 1 on leave
  { 
    id: 'ATT002', employeeId: 'EMP002', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '05:58', actualCheckOut: '14:00', status: 'present', lateMinutes: 0, locationId: 'PT-DT',
    checkInGps: { latitude: -6.1751, longitude: 106.8650, accuracy: 4, address: 'Plaza Tower Downtown, Jl. Thamrin No. 10, Jakarta' },
    checkOutGps: { latitude: -6.1752, longitude: 106.8651, accuracy: 5, address: 'Plaza Tower Downtown, Jl. Thamrin No. 10, Jakarta' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },
  { 
    id: 'ATT009', employeeId: 'EMP009', date: '2026-03-28', scheduledStart: '14:00', actualCheckIn: '14:22', actualCheckOut: null, status: 'late', lateMinutes: 12, locationId: 'PT-DT',
    checkInGps: { latitude: -6.1755, longitude: 106.8648, accuracy: 15, address: 'Near Plaza Tower, Jl. Thamrin, Jakarta' },
    checkInPhotoUrl: '/placeholder-selfie.jpg'
  },
  { 
    id: 'ATT015', employeeId: 'EMP015', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:35', actualCheckOut: '14:10', status: 'late', lateMinutes: 25, locationId: 'PT-DT',
    checkInGps: { latitude: -6.1760, longitude: 106.8645, accuracy: 20, address: 'Parking Area, Plaza Tower Downtown' },
    checkOutGps: { latitude: -6.1751, longitude: 106.8650, accuracy: 5, address: 'Plaza Tower Downtown, Jl. Thamrin No. 10, Jakarta' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },

  // Riverside Mall (RM) - 52 total, 45 present, 4 absent, 3 not checked in
  { 
    id: 'ATT003', employeeId: 'EMP003', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:45', actualCheckOut: null, status: 'late', lateMinutes: 35, locationId: 'RM',
    checkInGps: { latitude: -6.2250, longitude: 106.8100, accuracy: 25, address: 'Outside Riverside Mall, Jl. Gatot Subroto' },
    checkInPhotoUrl: '/placeholder-selfie.jpg'
  },
  { id: 'ATT005', employeeId: 'EMP005', date: '2026-03-28', scheduledStart: '14:00', actualCheckIn: null, actualCheckOut: null, status: 'absent', lateMinutes: 0, locationId: 'RM' },
  { 
    id: 'ATT010', employeeId: 'EMP010', date: '2026-03-28', scheduledStart: '22:00', actualCheckIn: '22:18', actualCheckOut: null, status: 'late', lateMinutes: 8, locationId: 'RM',
    checkInGps: { latitude: -6.2248, longitude: 106.8102, accuracy: 8, address: 'Riverside Mall, Main Entrance' },
    checkInPhotoUrl: '/placeholder-selfie.jpg'
  },

  // Metro Bank (MB-CT) - 28 total, 24 present, 1 absent, 2 not checked in, 1 on leave
  { id: 'ATT006', employeeId: 'EMP006', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: null, actualCheckOut: null, status: 'leave', lateMinutes: 0, locationId: 'MB-CT' },
  { 
    id: 'ATT012', employeeId: 'EMP012', date: '2026-03-28', scheduledStart: '08:00', actualCheckIn: '08:05', actualCheckOut: '16:00', status: 'present', lateMinutes: 0, locationId: 'MB-CT',
    checkInGps: { latitude: -6.1900, longitude: 106.8230, accuracy: 6, address: 'Metro Bank Central, Jl. Rasuna Said' },
    checkOutGps: { latitude: -6.1901, longitude: 106.8231, accuracy: 4, address: 'Metro Bank Central, Jl. Rasuna Said' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },

  // Corporate Center (CC-N) - 44 total, 38 present, 3 absent, 2 not checked in, 1 on leave
  { 
    id: 'ATT007', employeeId: 'EMP007', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:00', actualCheckOut: '14:15', status: 'present', lateMinutes: 0, locationId: 'CC-N',
    checkInGps: { latitude: -6.1650, longitude: 106.8900, accuracy: 4, address: 'Corporate Center North, Jl. Kuningan' },
    checkOutGps: { latitude: -6.1651, longitude: 106.8901, accuracy: 5, address: 'Corporate Center North, Jl. Kuningan' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },
  { 
    id: 'ATT013', employeeId: 'EMP013', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '06:42', actualCheckOut: '14:20', status: 'late', lateMinutes: 32, locationId: 'CC-N',
    checkInGps: { latitude: -6.1680, longitude: 106.8920, accuracy: 30, address: 'Traffic Light, Near Corporate Center' },
    checkOutGps: { latitude: -6.1650, longitude: 106.8900, accuracy: 6, address: 'Corporate Center North, Jl. Kuningan' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },

  // Industrial Park (IP-W) - 40 total, 35 present, 2 absent, 3 not checked in
  { 
    id: 'ATT008', employeeId: 'EMP008', date: '2026-03-28', scheduledStart: '06:00', actualCheckIn: '05:55', actualCheckOut: '14:00', status: 'present', lateMinutes: 0, locationId: 'IP-W',
    checkInGps: { latitude: -6.2400, longitude: 106.7800, accuracy: 5, address: 'Industrial Park West, Gate A' },
    checkOutGps: { latitude: -6.2401, longitude: 106.7801, accuracy: 4, address: 'Industrial Park West, Gate A' },
    checkInPhotoUrl: '/placeholder-selfie.jpg',
    checkOutPhotoUrl: '/placeholder-selfie.jpg'
  },
  { 
    id: 'ATT014', employeeId: 'EMP014', date: '2026-03-28', scheduledStart: '14:00', actualCheckIn: '14:28', actualCheckOut: null, status: 'late', lateMinutes: 18, locationId: 'IP-W',
    checkInGps: { latitude: -6.2420, longitude: 106.7780, accuracy: 18, address: 'Parking Lot, Industrial Park West' },
    checkInPhotoUrl: '/placeholder-selfie.jpg'
  },
]

// Day name helper
export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
