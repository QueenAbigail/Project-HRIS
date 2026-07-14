# Cron Jobs Documentation

## Auto-Absent Update Cron Job

### Purpose
Automatically marks employees as ABSENT when their scheduled shift has ended and they haven't checked in.

### Endpoint
```
POST /api/attendance/auto-absent
```

### Configuration
- **Interval**: Every 5-10 minutes (recommended)
- **Authentication**: Requires `CRON_SECRET` environment variable
- **Timezone**: GMT+7 (Southeast Asia)

### How It Works

1. **Triggered on schedule** (not based on shift times)
   - Every fixed interval (e.g., every 5 minutes), the cron job runs
   - No manual setup needed when adding new shifts
   - All pending records are automatically checked

2. **Automatic processing**
   - Fetches all records with `NOT_CHECKED_IN` status
   - Checks if each record's `scheduledEnd` time has passed (in GMT+7)
   - Automatically updates status to `ABSENT` if time has passed
   - No manual action needed

3. **Adding New Shifts**
   - When you create a new shift/attendance record, it's automatically included in the next cron run
   - No additional cron jobs need to be created
   - The existing cron handles all shifts uniformly

### Vercel Integration

To set up with Vercel Cron, add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/attendance/auto-absent",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Or set up via Vercel dashboard:
1. Go to your project settings
2. Add a cron job pointing to `/api/attendance/auto-absent`
3. Set the schedule (e.g., every 5 minutes: `*/5 * * * *`)
4. Ensure `CRON_SECRET` is set in environment variables

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
