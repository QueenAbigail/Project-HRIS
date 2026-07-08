# Suggested Cron Jobs for HRIS

## High Priority
1. **Mark Absent Employees** - `30 17 * * *` (5:30 PM)
   - Marks employees as ABSENT if no check-in for the day
   - Uses: Attendance + EmployeeShiftAssignment
   - Why: Critical for accurate attendance tracking

2. **Process Approved Leaves** - `45 17 * * *` (5:45 PM)
   - Auto-marks approved leave days as "PRESENT" or "LEAVE"
   - Updates attendance status for approved leave requests
   - Why: Leave shouldn't be counted as absence

## Medium Priority
3. **Reset Daily Overtime Counters** - `0 0 * * *` (Midnight)
   - Resets overtime tracking for new day
   - Why: Prevents overtime carryover

4. **Generate Daily Compliance Report** - `0 18 * * 1-5` (6 PM, weekdays)
   - Summarizes late, absent, present employees
   - Calculates department-wise attendance %
   - Why: Good for management dashboards

## Low Priority
5. **Send Late Notifications** - `30 8 * * 1-5` (8:30 AM)
   - Sends alerts about late employees
   
6. **Archive Old Attendance Data** - `0 22 1 * *` (Monthly)
   - Archives attendance older than 12 months
