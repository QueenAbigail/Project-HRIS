# Attendance Status Update Fix

## Problem
When employees checked in (check-in time was recorded), their attendance status was not being automatically updated from `NOT_CHECKED_IN` to `PRESENT` or `LATE`. The check-in time was being saved in the database, but the status field remained stuck on `NOT_CHECKED_IN`.

## Root Cause
The `/app/api/attendance/route.ts` endpoint had two issues:

1. **No status calculation on check-in** - When a POST request was made with an `actualCheckIn` time, the code wasn't calculating whether the employee was PRESENT (on time) or LATE (after scheduled start time).

2. **Invalid status value** - The code was setting status to `'CHECKED_IN'` (invalid enum value) instead of `'PRESENT'` or `'LATE'`.

3. **Missing display format conversion** - Database stores status as `NOT_CHECKED_IN` (UPPERCASE_WITH_UNDERSCORES) but the UI components expected lowercase-with-hyphens (`not-checked-in`).

## Solution

### 1. Added Status Calculation Function
Created `calculateAttendanceStatus()` in `/app/api/attendance/route.ts` that:
- Compares actual check-in time with scheduled start time
- Returns `PRESENT` if check-in is on or before scheduled time
- Returns `LATE` if check-in is after scheduled time
- Returns `NOT_CHECKED_IN` if no check-in time exists

### 2. Updated Attendance API
Modified both CREATE and UPDATE operations to:
- Calculate correct status when `actualCheckIn` is provided
- Log the status transition for debugging
- Properly handle edge cases with missing times

### 3. Created Attendance Utils Library
New file: `/lib/attendance-utils.ts` provides:
- `formatAttendanceStatus()` - Converts database format (PRESENT) to display format (present)
- `getAttendanceLabel()` - Returns user-friendly labels (Present, Late, On Leave, etc.)
- `getStatusStyles()` - Returns CSS classes for status badges
- `isLateCheckIn()` - Helper to determine if check-in was late

### 4. Updated Attendance Table Component
Updated `/components/attendance/attendance-table.tsx` to:
- Use the utility functions for consistent status formatting
- Replace hardcoded status mappings with utility functions
- Properly handle database format (UPPERCASE_WITH_UNDERSCORES) conversion

### 5. Fixed Existing Records
Ran migration script to update all existing attendance records that had:
- Check-in time recorded (`actualCheckIn` not null)
- Status still set to `NOT_CHECKED_IN`

Updated 4 records total:
- Adi Candra: 3 records updated from NOT_CHECKED_IN → PRESENT
- Test User: 1 record updated from NOT_CHECKED_IN → PRESENT

## Status Format Reference

### Database Enum Values
- `PRESENT` - Employee checked in on or before scheduled time
- `LATE` - Employee checked in after scheduled start time
- `ABSENT` - Employee was expected but didn't check in
- `LEAVE` - Employee has approved leave
- `NOT_CHECKED_IN` - Default when attendance record auto-generated

### Display Format
- Database: `PRESENT` (UPPERCASE)
- Display: `present` (lowercase)
- Label: `Present` (Title case)

### Status Badge Colors
- **PRESENT** → Green
- **LATE** → Orange/Warning
- **ABSENT** → Red
- **LEAVE** → Blue
- **NOT_CHECKED_IN** → Gray (Pending)

## Testing
To verify the fix works:

1. Check-in records now properly update status when employee checks in
2. Existing records with check-in times show correct PRESENT/LATE status
3. Status displays correctly in the attendance table with proper styling
4. The cron job that generates attendance records creates them with NOT_CHECKED_IN status initially

## Future Improvements
- Add automatic status update when check-out occurs
- Implement late calculation with configurable grace period
- Add status history/audit trail
- Allow manual status override with reason/notes
