# Cron Job Limitations in Vercel Sandbox

## Current Status

**Cron jobs are NOT running in the Vercel Sandbox environment.**

### Why?

The Vercel Sandbox is an ephemeral development environment that:
- Only runs when you're actively using it in your browser
- Stops running after a period of inactivity (typically 15-30 minutes)
- Does NOT have persistent background job execution capability
- Is designed for development and testing, not production workloads

Scheduled cron jobs (like `/api/attendance/generate-today`) are a **production feature** and require:
1. A deployed Vercel application (not a sandbox)
2. Vercel's serverless infrastructure running continuously
3. The ability to execute HTTP requests at scheduled times

### What Works in Sandbox

✅ Manual attendance generation via "Generate Today" button  
✅ API endpoints when you make requests  
✅ Database operations (Supabase connections)  
✅ Frontend development and testing  

### What Doesn't Work in Sandbox

❌ Scheduled cron jobs (no persistent background execution)  
❌ Webhook handlers that expect requests from external services  
❌ Long-running background tasks  
❌ Tasks that run when no one is actively using the app  

## Testing in Sandbox

To verify attendance generation works correctly in this environment:

1. **Click "Generate Today" button** on the Attendance page - this manually triggers the attendance generation logic
2. **Check the Cron Status Card** in SuperAdmin Dashboard to see if records were created successfully
3. **Verify the logs** in the cron status monitor

## Deployment to Production

When you deploy to Vercel (either via GitHub push or manual deployment):

1. Your `/vercel.json` cron configuration will be activated
2. Vercel's infrastructure will execute the cron job at the scheduled time: **Daily at 00:00 GMT+7 (17:00 UTC)**
3. Attendance records will be automatically generated for all employees with active pattern assignments
4. You can monitor cron executions in:
   - Vercel Dashboard > Cron Jobs logs
   - Your application's Cron Status Card (shows last 24 hours of runs)

## Current Setup Status

The attendance automation system is **fully configured and ready for production**:

- ✅ Cron schedule configured in `vercel.json`
- ✅ API endpoint `/api/attendance/generate-today` ready
- ✅ Status calculation logic working (PRESENT/LATE/NOT_CHECKED_IN)
- ✅ Cron logs database table created
- ✅ Dashboard monitoring card ready
- ✅ Pattern validation implemented
- ✅ Attendance preview working

Just need to deploy to Vercel for cron to run automatically!
