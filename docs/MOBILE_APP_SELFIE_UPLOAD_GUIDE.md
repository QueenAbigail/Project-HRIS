# Mobile App Selfie Upload Guide

## Problem Analysis
The website was trying to load selfie images from URLs like:
```
https://.../storage/v1/object/public/attendance-photos/{uuid}/masuk_2026-06-26.jpg
```

But the actual files **don't exist in Supabase storage** - only empty folders (UUIDs) exist.

## Root Cause
The database stores the full URL, but the actual image files were never uploaded to Supabase Storage. The mobile app is likely:
1. Creating the URL but not uploading the file, OR
2. Uploading to a different bucket/path, OR
3. Not handling upload errors properly

## Solution: Proper File Upload Flow

### Step 1: Upload Image to Supabase Storage

Use this method in your mobile app to upload the selfie:

```typescript
// Pseudocode for React Native / Flutter
async function uploadSelfie(imageFile: File, attendanceRecordId: string): Promise<string> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Generate unique filename
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `masuk_${timestamp}.jpg`; // or .png
    
    // Create folder path based on attendance record ID
    const filePath = `${attendanceRecordId}/${filename}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('attendance-photos')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw new Error(error.message);
    }
    
    // Return ONLY the relative path (not the full URL)
    return filePath; // Returns: "uuid/masuk_2026-07-02.jpg"
    
  } catch (error) {
    console.error('Error uploading selfie:', error);
    throw error;
  }
}
```

### Step 2: Send Attendance Data to Website API

Send the **relative path** (not full URL) to the backend API:

```typescript
async function checkIn(selfieImageFile: File) {
  try {
    // Step 1: Upload image and get path
    const selfieCheckInPath = await uploadSelfie(selfieImageFile, attendanceId);
    
    // Step 2: Send attendance data with path
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        locationId: location.id,
        actualCheckIn: new Date().toISOString(),
        gpsLat: currentLocation.latitude,
        gpsLng: currentLocation.longitude,
        selfieCheckIn: selfieCheckInPath, // Send path, NOT full URL
        status: 'PRESENT'
      })
    });
    
    const data = await response.json();
    console.log('Check-in successful:', data);
    
  } catch (error) {
    console.error('Check-in failed:', error);
  }
}
```

## What Changed on Website

The website modal now:

1. **Takes the stored path** from the database (e.g., `uuid/masuk_2026-07-02.jpg`)
2. **Constructs the full public URL** using:
   ```
   ${SUPABASE_URL}/storage/v1/object/public/attendance-photos/${selfieCheckInPath}
   ```
3. **Handles missing images gracefully** with a placeholder

## Checklist for Mobile App Fix

- [ ] Ensure image file is **uploaded to Supabase Storage FIRST**
- [ ] Verify the file exists in the bucket before sending API request
- [ ] Send **only the relative path** to the API (e.g., `uuid/filename.jpg`)
- [ ] **Don't construct the full URL** in the mobile app - let the website do that
- [ ] Add error handling for upload failures
- [ ] Add retry logic for failed uploads
- [ ] Test that images appear on the website after check-in

## Expected Flow

```
Mobile App:
1. User takes selfie photo
2. Upload photo to Supabase → returns path "uuid/masuk_2026-07-02.jpg"
3. Send check-in API with path
4. Database stores path

Website:
1. Modal opens
2. Fetches attendance record with path
3. Constructs full URL: https://.../attendance-photos/uuid/masuk_2026-07-02.jpg
4. Displays image
```

## Troubleshooting

### "Image not available" on website
1. Check if the file exists in Supabase Storage under `attendance-photos` bucket
2. Verify the folder structure: `{uuid}/{filename}.jpg`
3. Check the database value - should be just the path, not full URL

### Upload fails silently
1. Add console logs after each upload step
2. Check Supabase Storage bucket permissions (should be public)
3. Verify Supabase credentials in mobile app

### File size issues
- Set reasonable file size limit: ~5MB for mobile
- Compress images before upload if needed

