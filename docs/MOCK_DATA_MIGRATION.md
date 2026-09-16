# Mock Data Migration Plan

## Overview
This document tracks all locations where mock data from `lib/constants.ts` is being used in the project. These will need to be replaced with real database queries from Prisma.

**Status:** ❌ NOT STARTED - To be done after schedule feature is complete

---

## Mock Data Available

### In `lib/constants.ts`:
- `locations` - Sample office locations (HO, PT-DT, RM, MB-CT, CC-N, IP-W)
- `shifts` - Sample shift definitions (Morning, Evening, Night, etc.)
- `employeeSchedules` - Sample employee schedule assignments
- `todayAttendance` - Sample attendance records for today
- Various TypeScript types and interfaces

### In `lib/data.ts`:
All functions now reference mock constants directly:
- `isEmployeeWorkingDay()`
- `getEmployeeSchedule()`
- `getEmployeesOnDayOff()`
- `getScheduledEmployees()`
- `getDayOffCountByLocation()`
- `getLateCheckIns()`
- `getShiftEmployees()`
- `getShiftStats()`
- `getEmployeesWithAttendance()`
- `getBKOAssignments()`
- `getBKOCountByLocation()`
- `getTotalBKOAssignments()`

---

## Files Using Mock Data

### 1. Direct Constants Imports

#### `/app/superadmin/settings/page.tsx`
- **Uses:** `shifts`
- **Purpose:** Settings page displaying shift options
- **Replace with:** Query from `prisma.shift.findMany()`

#### `/components/dashboard/upcoming-shifts.tsx`
- **Uses:** `employeeSchedules, shifts, locations, todayAttendance`
- **Purpose:** Display upcoming shifts dashboard
- **Replace with:** Query from database

#### `/components/payroll/employee-debt-dialog.tsx`
- **Uses:** `locations, employeeSchedules`
- **Purpose:** Employee debt/payroll calculations
- **Replace with:** Query from database

#### `/components/shifts/ShiftFormDialog.tsx`
- **Uses:** `Shift` type
- **Purpose:** Form validation
- **Status:** Type only - safe to keep

#### `/components/attendance/attendance-table.tsx`
- **Uses:** `GpsCoordinates` type
- **Purpose:** Type definitions
- **Status:** Type only - safe to keep

---

### 2. Functions Using Mock Data (via lib/data.ts)

#### `/app/dashboard/reports/page.tsx`
- **Uses:** `getOverallAttendanceStats()`, `getLocationAttendanceStats()`, `getLateCheckIns()`
- **Purpose:** Show attendance reports with mock data
- **Replace with:** Query from database

#### `/app/dashboard/shifts/page.tsx`
- **Uses:** Functions from `lib/data.ts`
- **Purpose:** Show shift statistics
- **Replace with:** Query from database

#### `/components/dashboard/late-checkins.tsx`
- **Uses:** `getLateCheckInSeverity()`
- **Purpose:** Display late check-ins widget
- **Replace with:** Query from database

#### `/components/dashboard/stats-cards.tsx`
- **Uses:** `getOverallAttendanceStats()`
- **Purpose:** Show dashboard statistics
- **Replace with:** Query from database

#### `/components/dashboard/upcoming-shifts.tsx`
- **Uses:** `formatTime()`
- **Purpose:** Format time display
- **Status:** Utility function - safe to keep

#### `/components/reports/attendance-location-filter.tsx`
- **Uses:** `LocationAttendanceStats`
- **Purpose:** Filter attendance by location
- **Replace with:** Query from database

#### `/components/reports/employee-location-filter.tsx`
- **Uses:** `LocationAttendanceStats`
- **Purpose:** Filter employees by location
- **Replace with:** Query from database

#### `/components/reports/location-filter.tsx`
- **Uses:** `LocationAttendanceStats`
- **Purpose:** Location filtering
- **Replace with:** Query from database

#### `/components/reports/payroll-location-filter.tsx`
- **Uses:** `LocationAttendanceStats`
- **Purpose:** Payroll filtering by location
- **Replace with:** Query from database

---

## Pages Currently Showing Mock Data

| Page | URL | Mock Data Used | Priority |
|------|-----|----------------|----------|
| Dashboard | `/dashboard` | Schedules, Attendance, Late Check-ins | HIGH |
| Reports | `/dashboard/reports` | Attendance Stats | HIGH |
| Shifts | `/dashboard/shifts` | Shift Statistics | MEDIUM |
| Settings | `/superadmin/settings` | Shift Definitions | MEDIUM |
| Payroll | `/payroll/*` | Location & Employee Data | LOW |

---

## Migration Strategy

### Phase 1: Replace Data Access Functions
1. Update all functions in `lib/data.ts` to query Prisma instead of mock constants
2. Add proper error handling and loading states
3. Test each function independently

### Phase 2: Update Dashboard Components
1. Replace `/app/dashboard/reports/page.tsx`
2. Replace `/app/dashboard/shifts/page.tsx`
3. Replace dashboard widgets (late-checkins, stats-cards, upcoming-shifts)

### Phase 3: Update Admin Pages
1. Replace `/app/superadmin/settings/page.tsx`
2. Update shift and pattern management

### Phase 4: Update Reports & Filters
1. Replace all report components
2. Update location/employee filters

### Phase 5: Update Payroll
1. Replace payroll components with real data

---

## Database Schema Needed

Ensure these Prisma models exist and are properly set up:
- `User` (employees)
- `Shift` (shift definitions)
- `Location` (office locations)
- `Schedule` (employee schedules)
- `Attendance` (daily attendance records)

---

## Notes

- **Removed Zustand Store:** `useSchedulesStore.ts` was deleted to avoid stale cache issues
- **Current State Management:** Using local `useState` in components + API calls
- **API Endpoints Available:**
  - `GET /api/schedules` - Get all schedules
  - `POST /api/schedules/import` - Bulk import from Excel
  - `/api/schedules/[id]` - Update/delete individual schedules

---

## Checklist for Later

- [ ] Replace `lib/data.ts` functions with Prisma queries
- [ ] Update dashboard pages to use real data
- [ ] Update admin settings pages
- [ ] Update reports and filters
- [ ] Test all pages with real database data
- [ ] Remove mock data from `lib/constants.ts` (keep types)
- [ ] Remove mock data imports from components
- [ ] Verify no stale cache issues after changes
