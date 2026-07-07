# Attendance Status Reference Guide

## Current Available Status Values

The system uses the following attendance statuses defined in the `AttendanceStatus` enum in the Prisma schema:

### Status Values (Database Format)
```
- NOT_CHECKED_IN  (default when attendance record is created)
- PRESENT         (when employee checked in on time)
- LATE            (when employee checked in after scheduled time)
- ABSENT          (when employee was expected but didn't check in)
- LEAVE           (when employee has approved leave for the day)
```

## Display Format & UI Styling

The system uses lowercase keys for internal formatting and displays them as human-readable labels:

### Status Mapping Table

| Database Value | Display Key | Display Label | Badge Color | Color Class |
|---|---|---|---|---|
| NOT_CHECKED_IN | not-checked-in | Pending | Gray/Muted | `bg-muted text-muted-foreground` |
| PRESENT | present | Present | Green (Success) | `bg-success/10 text-success` |
| LATE | late | Late | Orange (Warning) | `bg-warning/10 text-warning` |
| ABSENT | absent | Absent | Red (Destructive) | `bg-destructive/10 text-destructive` |
| LEAVE | leave | On Leave | Blue (Chart-2) | `bg-chart-2/10 text-chart-2` |

### Additional Status (UI Only)
| Display Key | Display Label | Badge Color | Color Class |
|---|---|---|---|
| day-off | Day Off | Blue (Primary) | `bg-primary/10 text-primary/70` |

## Implementation Details

### Status Styles (from attendance-table.tsx)
```typescript
const statusStyles: Record<string, string> = {
  'present': 'bg-success/10 text-success border-success/20',
  'late': 'bg-warning/10 text-warning border-warning/20',
  'absent': 'bg-destructive/10 text-destructive border-destructive/20',
  'leave': 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  'not-checked-in': 'bg-muted text-muted-foreground border-muted',
  'day-off': 'bg-primary/10 text-primary/70 border-primary/20',
}
```

### Status Labels (from attendance-table.tsx)
```typescript
const statusLabels: Record<string, string> = {
  'present': 'Present',
  'late': 'Late',
  'absent': 'Absent',
  'leave': 'On Leave',
  'not-checked-in': 'Pending',
  'day-off': 'Day Off',
}
```

## Attendance Flow

1. **Record Creation** (via cron job):
   - Employees with active shift pattern assignments get attendance records created
   - Initial status: `NOT_CHECKED_IN` (displayed as "Pending")
   - This happens daily at 00:00 GMT+7

2. **Check-In Process**:
   - Employee checks in via mobile/web app with GPS location, timestamp, and optional selfie
   - System compares `actualCheckIn` time with `scheduledStart` time
   - Status updates to:
     - `PRESENT` - if checked in before or at scheduled time
     - `LATE` - if checked in after scheduled start time
     - `lateMinutes` field records the delay

3. **Absence Handling**:
   - If employee has not checked in by end of day: status remains `NOT_CHECKED_IN` or marked `ABSENT`
   - If employee has approved leave: status is `LEAVE`

## Database Schema

```prisma
model Attendance {
  id             String           @id @default(cuid())
  userId         String
  date           DateTime         @db.Date
  locationId     String?
  shiftId        String?
  scheduledStart String?          // Format: "HH:MM"
  scheduledEnd   String?          // Format: "HH:MM"
  actualCheckIn  DateTime?        // Full timestamp with timezone
  actualCheckOut DateTime?        // Full timestamp with timezone
  status         AttendanceStatus @default(NOT_CHECKED_IN)
  lateMinutes    Int              @default(0)
  gpsLat         Float?
  gpsLng         Float?
  gpsLatPulang   Float?
  gpsLngPulang   Float?
  selfieCheckIn  String?          // Photo URL
  selfieCheckOut String?          // Photo URL
  notes          String?
  
  @@unique([userId, date])
  @@index([userId])
  @@index([locationId])
  @@index([date])
}

enum AttendanceStatus {
  PRESENT
  LATE
  ABSENT
  LEAVE
  NOT_CHECKED_IN
}
```

## Current Database Statistics

- **Total Attendance Records**: 15
- **Status Distribution**:
  - NOT_CHECKED_IN: X records
  - PRESENT: X records

## Usage in Components

### Displaying Status Badge
```tsx
<Badge variant="outline" className={statusStyles[record.status.toLowerCase()]}>
  {statusLabels[record.status.toLowerCase()]}
</Badge>
```

### Filtering by Status
```tsx
const lateRecords = records.filter(r => r.status === 'late')
const presentRecords = records.filter(r => r.status === 'present')
const absentRecords = records.filter(r => r.status === 'absent' || r.status === 'not-checked-in')
const dayOffRecords = records.filter(r => r.status === 'day-off')
```

## Format Consistency Notes

- **Enum values in database**: UPPERCASE_WITH_UNDERSCORES (e.g., `NOT_CHECKED_IN`)
- **Display keys in components**: lowercase-with-hyphens (e.g., `not-checked-in`)
- **Display labels in UI**: Title Case (e.g., `Pending`, `Present`, `Late`)
- Always convert status to lowercase before looking up in `statusStyles` or `statusLabels` objects
