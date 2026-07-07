# Selfie Image Loading Issue - Diagnosis & Solution

## Problem Identified

The selfie images in the attendance modal show as "Image not available" placeholder. When you tried to access the image URLs directly from Supabase, you received a **404 "Bucket not found"** error.

## Root Cause Analysis

### What We Found:
1. **Database Level**: The `attendances` table contains URLs in the `selfieCheckIn` column pointing to Supabase storage
   - Example URL: `https://zzjtnawtmasacbhppt.supabase.co/storage/v1/object/public/attendance-photos/8cfb2007-0d12-4d00-bf50-978e10f0af12/masuk_2026-06-26.jpg`

2. **Supabase Storage Level**: The `attendance-photos` bucket EXISTS and contains 2 folders
   - Folders: `6bc9bbd6-aed8-42af-ab2c-4f77b0529e58/` and `8cfb2007-0d12-4d00-bf50-978e10f0af12/`
   - **BUT**: The `.jpg` files inside these folders don't exist

3. **The Real Issue**: 
   - URLs were saved in the database BEFORE the actual files were uploaded
   - The folder structure was created (by UUID), but the image files (`masuk_2026-06-26.jpg`, etc.) were never uploaded into those folders
   - When the modal tries to load the image, the HTTP request returns 404

## Solution Implemented

### Code-Level Fix (Modal Component):
Added error handling to gracefully show a placeholder when images can't load:

```tsx
{selfieCheckInError ? (
  <div className="w-full max-w-xs h-64 rounded-lg border bg-muted/50 flex items-center justify-center">
    <div className="text-center">
      <Camera className="size-8 text-muted-foreground mb-2" />
      <p className="text-xs text-muted-foreground">Image not available</p>
    </div>
  </div>
) : (
  <img 
    src={selfieCheckIn} 
    alt="Check-in selfie" 
    onError={() => setSelfieCheckInError(true)}
  />
)}
```

### What This Does:
- Attempts to load the image from the URL
- If the image fails to load (404 or network error), `onError` callback triggers
- Shows a user-friendly "Image not available" placeholder instead of broken image
- Prevents page crashes due to missing images

## What You Need to Do to Fix This Completely

### Option 1: Upload Missing Images (If you have backups)
1. Go to Supabase Storage → `attendance-photos` bucket
2. For each attendance record, upload the selfie image to its folder:
   - Folder: `{attendanceId}/`
   - Filename: Must match what's in the database URL (e.g., `masuk_2026-06-26.jpg`)

### Option 2: Clear Invalid URLs (If images are lost)
```sql
UPDATE attendances SET selfieCheckIn = NULL WHERE selfieCheckIn LIKE '%attendance-photos%';
```

### Option 3: Fix Upload Code
If selfies are being captured going forward, ensure the check-in mobile/web app:
1. Takes a photo
2. Uploads it to Supabase bucket at path: `attendance-photos/{attendanceId}/{filename}.jpg`
3. Gets back a signed/public URL
4. **THEN** saves that URL to the database

**Current order is reversed** - the code saved the URL before uploading the file!

## Technical Details

**Database Table**: `attendances`
**Column**: `selfieCheckIn` (text)
**Storage Bucket**: `attendance-photos` (public)
**Expected Path Format**: `{bucketId}/masuk_{date}.jpg`

## Status

✅ **Modal now shows graceful error handling**
⚠️ **Images will still not display until files are uploaded to storage**
📝 **No code changes needed in the attendance details modal** - the fix is in place and waiting for actual files to exist

## Testing

When you upload selfie images to the correct Supabase storage paths, they will automatically display in the modal without any code changes needed.
