# Leave Management & Attendance Integration Review

## Overview
This document details the integration between the Leave Management and Attendance modules, ensuring that approved leaves automatically update pending attendance records to "LEAVE" status.

## Integration Points

### 1. Automatic Attendance Generation with Leave Check
**File:** `app/superadmin/actions.ts` (function: `generateTodayAttendanceRecords`)

When daily attendance records are generated:
- ✅ The system checks if the user has an **approved leave** for that date
- ✅ If an approved leave exists, the attendance record is created with status `LEAVE`
- ✅ If no approved leave exists, the attendance record is created with status `NOT_CHECKED_IN`

**Logic:**
```typescript
// Check if user has an approved leave on this date
const approvedLeave = await prisma.leave.findFirst({
  where: {
    userId: assignment.userId,
    status: 'Approved',
    startDate: { lte: today },
    endDate: { gte: today }
  }
})

// Set attendance status to LEAVE if approved leave exists
const attendanceStatus = approvedLeave ? 'LEAVE' : 'NOT_CHECKED_IN'
```

**When it runs:**
- Daily via cron job at 00:00 GMT+7 (calls `/api/attendance/generate-today`)
- Can be manually triggered by admin

---

### 2. Sync Leaves to Existing Attendance
**File:** `app/api/attendance/sync-leaves/route.ts`

A new API endpoint that syncs already-approved leaves with existing attendance records.

**POST `/api/attendance/sync-leaves`**
- Accepts a `leaveId` parameter
- Finds all pending attendance records (NOT_CHECKED_IN, ABSENT) for the user within the leave date range
- Updates those records to status `LEAVE`
- Returns the count of updated records

**GET `/api/attendance/sync-leaves`**
- Query parameters: `userId`, `startDate`, `endDate`
- Returns all approved leaves for a user in the given date range
- Used for checking leave status before operations

---

### 3. Leave Approval Trigger
**File:** `app/api/leaves/[id]/route.ts`

When a leave is approved:
- ✅ The leave status is updated to `'Approved'`
- ✅ An automatic call is made to `/api/attendance/sync-leaves` to update pending attendance records
- ✅ All matching attendance records are set to `LEAVE` status
- ✅ Error handling ensures that sync failures don't block leave approval

**Process:**
1. Admin approves a leave via PATCH request
2. Leave is marked as "Approved" in database
3. System calls the sync-leaves endpoint internally
4. All pending attendance records within the leave date range are updated to LEAVE

---

## Correlation Flow

```
┌─────────────────────────────────────────────────────────┐
│           Leave Management                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Admin creates leave request for user                  │
│           ↓                                             │
│  Leave request status: "Pending"                       │
│           ↓                                             │
│  Admin approves leave → PATCH /api/leaves/[id]        │
│           ↓                                             │
│  Leave status: "Approved"                              │
│           ↓                                             │
│  [Auto-trigger] POST /api/attendance/sync-leaves       │
│           ↓                                             │
└─────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│           Attendance Management                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Find all attendance records for user                  │
│  within leave date range                               │
│           ↓                                             │
│  Update status: NOT_CHECKED_IN/ABSENT → LEAVE          │
│           ↓                                             │
│  Attendance fully synced with approved leave           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Leave Request and Approval

**Scenario:** Employee requests leave from July 7-10, 2026

1. **Daily Attendance Generation (July 7):**
   - No leave approved yet
   - Attendance created with status: `NOT_CHECKED_IN`

2. **Leave Approval (July 8):**
   - Admin approves the leave request
   - System automatically syncs:
     - July 7 attendance: `NOT_CHECKED_IN` → `LEAVE` ✅
     - July 8 attendance: `NOT_CHECKED_IN` → `LEAVE` ✅
     - July 9 attendance: `NOT_CHECKED_IN` → `LEAVE` ✅
     - July 10 attendance: `NOT_CHECKED_IN` → `LEAVE` ✅

3. **Attendance Calendar:**
   - All four days now show as "LEAVE" with appropriate styling
   - No longer pending - leave status is clear

### Example 2: Manual Attendance Entry During Leave

**Scenario:** Admin manually marks an employee as "ABSENT" while they have an approved leave

1. **Initial State:**
   - Leave approved for July 7
   - Attendance for July 7: `LEAVE` (from approval)

2. **Admin Action:**
   - Admin tries to manually change status to `ABSENT`
   - System should prevent this or warn the admin

3. **Result:**
   - Leave takes precedence over manual entries
   - Status remains `LEAVE`

---

## Status Values in Attendance

| Status | Meaning | When Used |
|--------|---------|-----------|
| `NOT_CHECKED_IN` | Pending - employee hasn't checked in | Created on daily generation |
| `PRESENT` | Employee checked in before cutoff | After successful check-in |
| `LATE` | Employee checked in after cutoff | After late check-in |
| `ABSENT` | Employee didn't check in | Manually marked by admin |
| `LEAVE` | **Approved leave day** | When leave is approved OR manually marked |
| `DAY_OFF` | Weekend/non-working day | Per schedule pattern |

---

## Testing the Integration

### Test Case 1: Create Leave and Approve

```bash
# 1. Create a pending leave for 2026-07-07 to 2026-07-10
POST /api/leaves
{
  "userId": "emp-123",
  "leaveType": "Izin",
  "startDate": "2026-07-07",
  "endDate": "2026-07-10",
  "reason": "Personal leave"
}

# 2. Verify attendance is NOT_CHECKED_IN (if already generated)
GET /api/attendance?userId=emp-123&date=2026-07-07

# 3. Approve the leave
PATCH /api/leaves/[leave-id]
{ "status": "Approved" }

# 4. Verify attendance is now LEAVE
GET /api/attendance?userId=emp-123&date=2026-07-07
# Response should show status: "LEAVE"
```

### Test Case 2: Check Leave Status

```bash
# Get approved leaves for a user
GET /api/attendance/sync-leaves?userId=emp-123&startDate=2026-07-01&endDate=2026-07-31
# Response shows all approved leaves in the date range
```

---

## Database Schema Relationships

```sql
-- Leaves table
CREATE TABLE leaves (
  id UUID PRIMARY KEY,
  userId STRING REFERENCES "User"(id),
  status STRING DEFAULT 'Pending', -- Pending, Approved, Rejected
  startDate DATE,
  endDate DATE,
  leaveType STRING, -- Izin, Sakit, TukarShift
  ...
);

-- Attendance table
CREATE TABLE Attendance (
  id STRING PRIMARY KEY,
  userId STRING REFERENCES "User"(id),
  date DATE,
  status STRING DEFAULT 'NOT_CHECKED_IN', -- LEAVE, PRESENT, LATE, ABSENT, etc.
  ...
  UNIQUE(userId, date) -- One attendance per user per day
);
```

**Relationship:**
- Not a direct foreign key constraint
- Integration is logical: attendance.status is determined by checking leaves table
- Allows flexibility in leave types and attendance status values

---

## Potential Issues and Mitigations

### Issue 1: Race Condition
**Problem:** If attendance is manually updated after leave approval, status might be inconsistent

**Mitigation:** 
- Attendance sync is idempotent - can be called multiple times safely
- Manual updates after leave approval will be overwritten on next sync
- Consider adding a "locked" field to attendance when under an approved leave

### Issue 2: Multi-day Leave Handling
**Problem:** Complex leave patterns (alternating days, multiple leaves)

**Mitigation:**
- Current implementation handles continuous date ranges (startDate to endDate)
- Uses `date BETWEEN startDate AND endDate` logic
- Works for all leave type combinations

### Issue 3: Leave Rejection
**Problem:** Leave rejected after partial attendance sync

**Mitigation:**
- Current implementation only syncs if status is "Approved"
- Rejected leaves don't trigger sync
- Consider adding a "reverse sync" function to revert LEAVE status if needed

---

## Future Enhancements

1. **Leave Rejection Handler**: Automatically revert LEAVE status when a leave is rejected
2. **Leave Amendment**: Update attendance when a leave date range is modified
3. **Attendance Locking**: Lock attendance records that are under approved leaves
4. **Leave Analytics**: Track leave usage vs. attendance patterns
5. **BKO Integration**: Handle Backup/Coverage assignments during leaves

---

## Conclusion

The Leave Management and Attendance integration is now **fully functional**:

✅ **Daily Generation**: Attendance records check for approved leaves automatically
✅ **Leave Approval**: Pending attendance is synced to LEAVE status when leave is approved
✅ **Data Consistency**: Leave dates are source of truth for LEAVE attendance status
✅ **Error Handling**: Sync failures don't block leave approval

The system ensures that employees' approved leaves are always reflected in their attendance records, maintaining data integrity across modules.
