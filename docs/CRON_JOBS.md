# Cron Jobs Documentation

## Auto-Absent Update Cron Job

### Purpose
Automatically marks employees as ABSENT when their scheduled shift has ended and they haven't checked in.

### Endpoint
```
POST /api/attendance/auto-absent
```

### Configuration
- **Interval**: Hourly at XX:05 (since all shifts end at :00)
- **Schedule**: `5 * * * *` (5 minutes past every hour)
- **Authentication**: Requires `CRON_SECRET` environment variable
- **Timezone**: GMT+7 (Southeast Asia)

### How It Works

The only trigger for ABSENT status is the cron job:

```
NOT_CHECKED_IN (created at 00:00 GMT+7)
    ↓
Cron runs at XX:05 every hour
    ↓
Checks: Has scheduled end time passed?
    ↓
If YES → Update to ABSENT
If NO → Remain as NOT_CHECKED_IN
```

1. **Fixed schedule** - Runs at 5 minutes past every hour (XX:05 GMT+7)
   - Shifts end at :00, so checking at XX:05 gives a 5-minute buffer
   - Perfect timing since all shifts in your system end at :00

2. **Automatic for ALL shifts**
   - Fetches all records with `NOT_CHECKED_IN` status
   - Checks if each record's `scheduledEnd` time has passed (in GMT+7)
   - Updates to `ABSENT` if time has passed
   - No manual setup needed when adding new shifts

3. **No additional configuration required**
   - When you create a new shift/attendance record, it's automatically included in the next hourly cron run
   - The existing cron handles all shifts uniformly
   - No additional cron jobs need to be created

## Attendance Generation Cron Job

### Purpose
Generates daily attendance records based on employee schedules at the start of each day.

### Configuration
- **Time**: `0 17 * * *` (UTC) = 00:00 GMT+7 (midnight start of day)
- **Endpoint**: `/api/attendance/generate-today`
- **Frequency**: Once per day at midnight GMT+7
- **Status**: Creates all records with initial `NOT_CHECKED_IN` status

### Current Vercel Setup

In `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/attendance/generate-today",
      "schedule": "0 17 * * *"
    },
    {
      "path": "/api/attendance/auto-absent",
      "schedule": "5 * * * *"
    }
  ]
}
```

**Summary:**
- `0 17 * * *` - Generate today's attendance at 00:00 GMT+7 (5 PM UTC)
- `5 * * * *` - Auto-mark absent at XX:05 every hour GMT+7

**Already configured** in `vercel.json` - no manual setup needed in Vercel dashboard.

To verify it's running:
1. Deploy to Vercel
2. Check Vercel project logs for cron execution
3. Verify `CRON_SECRET` is set in environment variables

### Timezone Handling

All time comparisons use GMT+7 timezone:
- Server converts UTC time to GMT+7 automatically
- Scheduled end times are compared in GMT+7 local time
- Dates are parsed as local dates to avoid timezone conversion issues

### Performance Benefits

- **API Response Speed**: Main attendance API doesn't perform auto-updates, only cron does
- **Scalability**: Single background job handles all updates efficiently
- **Consistency**: Updates happen at predictable intervals
- **Reliability**: Retries happen automatically without affecting user experience

### Monitoring

Check logs for:
- `[v0] Auto-absent cron job started` - Indicates cron execution
- `[v0] GMT+7 current time` - Shows when cron ran in GMT+7
- `[v0] Found X NOT_CHECKED_IN records` - Number of pending records checked
- `[v0] Checking [employee name]` - Details of each record checked

### Troubleshooting

If records aren't being auto-updated:
1. **Check CRON_SECRET** - Verify it's set in environment
2. **Check timezone** - Ensure your current GMT+7 time is after the scheduled end time
3. **Check logs** - Review deployment logs for cron execution
4. **Verify schedule** - Make sure cron is set to run frequently enough
