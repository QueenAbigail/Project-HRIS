# Attendance Automation System - Implementation & Troubleshooting Guide

## Overview
The attendance automation system automatically generates attendance records daily based on employee shift pattern assignments. This ensures the system has a record of expected attendance for each working day without manual intervention.

---

## System Architecture

### 1. **Cron Job (Vercel Scheduled Functions)**
- **Schedule**: `0 17 * * *` (17:00 UTC = 00:00 GMT+7)
- **Frequency**: Daily, runs automatically every day at midnight GMT+7
- **Endpoint**: `POST /api/attendance/generate-today`
- **Authentication**: Requires `CRON_SECRET` environment variable

### 2. **Pattern Types Supported**
The system supports three types of shift patterns:

#### **FIXED Pattern**
- Simple repeating weekly schedule
- Example: Monday-Friday work, Saturday-Sunday off
- **Data Structure**:
  ```json
  {
    "type": "FIXED",
    "workingDays": [1, 2, 3, 4, 5],  // 0=Sun, 1=Mon, ... 6=Sat
    "shiftId": "shift_id"
  }
  ```

#### **ROTATING Pattern**
- Cycles through different work/rest schedules
- Example: 2 days on, 2 days off, repeat
- **Data Structure**:
  ```json
  {
    "type": "ROTATING",
    "rotatingPattern": {
      "sequence": [
        { "days": 2, "shiftType": "morning" },
        { "days": 2, "shiftType": "rest" }
      ],
      "startDate": "2026-06-15"
    }
  }
  ```

#### **MODULO Pattern**
- Cycles through shift types in a repeating sequence
- Example: Morning shift, then Night shift, then Rest day, repeat
- **Data Structure**:
  ```json
  {
    "type": "MODULO",
    "moduloPattern": {
      "sequence": ["morning", "night", "rest"],
      "startDate": "2026-06-15"
    }
  }
  ```

---

## Critical Requirements for Automation to Work

### ✅ Requirement 1: Employee Must Have a Primary Site
The system REQUIRES that every employee has a `siteId` (primary work location) set on their user record.

**How to Check:**
1. Navigate to Employees > View Employee Details
2. Under "Personal Info" tab, the employee must have a location assigned
3. This location is stored as `siteId` in the user record

**If Missing:**
- Pattern assignments will be skipped
- No attendance records will be generated
- Check logs for: "Skipping - user has no site assigned"

### ✅ Requirement 2: Pattern Assignment Must Be Active
The pattern assignment MUST have:
- Status: **ACTIVE**
- `startDate` ≤ today
- `endDate` null OR `endDate` ≥ today

**Current Test User Assignment:**
- Employee: Test User Staff
- Pattern: Pattern 1 (ROTATING)
- Status: ACTIVE ✓
- Start Date: Jun 15, 2026 ✓
- End Date: NULL (ongoing) ✓

### ✅ Requirement 3: Pattern Must Be Properly Configured
The pattern must have the correct type and valid configuration:
- **Type** must be one of: FIXED, ROTATING, or MODULO
- **Data** must match the type (e.g., FIXED must have workingDays)
- **For ROTATING/MODULO**: startDate must be set and sequence must be valid

### ✅ Requirement 4: Environment Variable Must Be Set
The `CRON_SECRET` environment variable MUST be configured:
```bash
CRON_SECRET=your-secure-random-secret
```

---

## How It Works - Step by Step

### Daily Cron Job Flow (Runs at 00:00 GMT+7)

1. **Vercel triggers** `/api/attendance/generate-today`
2. **Authentication**: Validates `CRON_SECRET` header
3. **Pattern Lookup**: Finds all ACTIVE pattern assignments covering today
4. **For Each Assignment**:
   - ✓ Verify employee has a `siteId`
   - ✓ Check if employee is scheduled for today based on pattern type
   - ✓ Check if attendance record already exists for today
   - ✓ Create attendance record with `NOT_CHECKED_IN` status if not exists
5. **Notification**: Updates are cached and pages are revalidated

### Status Lifecycle

```
NOT_CHECKED_IN (initial)
    ↓
PRESENT (employee checks in)
    ↓
LATE (if after grace period)
```

---

## Troubleshooting Guide

### Issue 1: "No records found" in Attendance Table
**Possible Causes:**

#### A. Employee has no siteId
```
[v0] Skipping - user has no site assigned: user_id
```
**Solution**: Edit employee > Personal Info > Assign Location/Site

#### B. Pattern assignment has wrong status
**Check**: Is status ACTIVE (green badge)?
**Solution**: Edit assignment and set status to ACTIVE

#### C. Pattern assignment date range doesn't cover today
```
[v0] Check startDate ≤ today AND (endDate null OR endDate ≥ today)
```
**Solution**: Adjust assignment period to include today

#### D. Pattern is ROTATING/MODULO but not scheduled for today
```
[v0] ROTATING pattern - ... Rest cycle: {...}
[v0] MODULO pattern - ... Off day: ...
```
**Solution**: Check pattern configuration - today might be a rest/off day

#### E. CRON_SECRET not set or wrong
```
[v0] Unauthorized - Invalid token
```
**Solution**: Set CRON_SECRET in environment variables

### Issue 2: Cron Job Not Running
**Verification Steps:**

1. Check if cron is configured in `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/attendance/generate-today",
       "schedule": "0 17 * * *"
     }]
   }
   ```

2. Check Vercel Logs:
   - Dashboard → Project → Deployments → Recent Deployment → Logs
   - Filter for `/api/attendance/generate-today`

3. Manual Test:
   ```bash
   curl -X POST http://localhost:3000/api/attendance/generate-today \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

### Issue 3: Attendance Records Not Showing Scheduled Shifts
**Expected Behavior**: Attendance records should appear even before employee checks in

**Problem**: Records might be filtered out by date or status

**Solution**: Ensure the page filters include:
- Date: Today
- Status: ALL or NOT_CHECKED_IN

---

## Recommendations for Seamless Operation

### 1. **Add Cron Status Dashboard**
Create a page to monitor cron job execution:
- Last run timestamp
- Records created
- Records skipped with reasons
- Any errors encountered

### 2. **Implement Retry Logic**
Add automatic retry if cron fails:
- Retry after 15 minutes if initial run fails
- Log retry attempts for debugging

### 3. **Add Email Notifications**
Notify admins if:
- Cron job fails
- Fewer records created than expected
- Errors with specific employees

### 4. **Enhance Pattern Validation**
Add pre-save validation for patterns:
- Verify workingDays array is valid
- Verify rotating/modulo sequences are well-formed
- Test pattern against sample dates

### 5. **Add Employee Site Assignment Wizard**
Since siteId is critical:
- Bulk assign employees to sites
- Warn when creating pattern assignments without siteId
- Show which employees are missing site assignment

### 6. **Improve Debugging**
Make logs accessible in UI:
- Add "Attendance Generation Logs" section in admin panel
- Show last 50 cron executions with detailed output
- Filter logs by date, employee, or result

### 7. **Add Manual Trigger with Confirmation**
Current "Generate Today" button is good but:
- Show preview of what will be generated
- Show which employees will be affected
- Confirm count of records to be created

### 8. **Implement Deduplication Check**
Already done, but enhance by:
- Show if record already exists for today
- Offer option to regenerate (delete and recreate)
- Show created vs skipped breakdown per employee

---

## Testing Checklist

- [ ] Pattern assignment is ACTIVE
- [ ] Employee has siteId assigned
- [ ] Pattern type is valid (FIXED/ROTATING/MODULO)
- [ ] Pattern configuration matches type
- [ ] For ROTATING/MODULO: today is a working day in the sequence
- [ ] CRON_SECRET is set in environment
- [ ] Test "Generate Today" button manually
- [ ] Verify attendance record appears with NOT_CHECKED_IN status
- [ ] Wait for cron to run at 00:00 GMT+7 and verify new records

---

## Performance Notes

- **Scalability**: Handles thousands of employees efficiently
- **Frequency**: Once daily (00:00 GMT+7) - low impact
- **Deduplication**: Prevents duplicate records
- **Caching**: Pages revalidate after generation for fresh data

---

## Quick Reference

| Component | Status | Details |
|-----------|--------|---------|
| Cron Schedule | ✅ Configured | 0 17 * * * (00:00 GMT+7) |
| API Route | ✅ Implemented | `/api/attendance/generate-today` |
| Pattern Types | ✅ All 3 supported | FIXED, ROTATING, MODULO |
| Logging | ✅ Detailed | Check server logs for [v0] tags |
| Manual Trigger | ✅ Available | "Generate Today" button in UI |
| Error Handling | ✅ Implemented | Graceful failures with detailed logs |
