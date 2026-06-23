# App Logo Setup Guide

To use the app logo upload feature in the System Information page, you need to create a storage bucket in your Supabase project.

## Method 1: Automatic Setup (Recommended)

### Step 1: Get your Supabase credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings > API**
4. Copy:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Service Role Key (the long string under "Service Role")

### Step 2: Run the setup script

Run this command in your terminal from the project root:

```bash
SUPABASE_URL="https://xxxxx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
node scripts/setup-supabase-storage.mjs
```

Replace `https://xxxxx.supabase.co` with your Project URL and `your-service-role-key` with your Service Role Key.

**Expected output:**
```
🔧 Setting up Supabase storage buckets...

📦 Creating "logos" bucket...
✓ "logos" bucket created successfully

✅ All buckets are ready!

You can now upload logos in the System Information page.
```

### Step 3: Upload your logo

1. Go to Admin Dashboard → Information
2. Under "App Logo", click "Choose File"
3. Select your company logo image (PNG, JPG, SVG, or WebP)
4. Click "Save Changes"
5. Your logo will be uploaded to Supabase Storage and used across the app!

---

## Method 2: Manual Setup (via Supabase Dashboard)

If you prefer to create the bucket manually:

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Go to **Storage** (left sidebar)
3. Click **Create a new bucket**
4. Name it: `logos`
5. Uncheck "Private bucket" to make it public
6. Set file size limit to 5MB
7. Click **Create bucket**

Then you can upload logos in the System Information page!

---

## Troubleshooting

### Error: "Bucket not found"
- Make sure you've created the `logos` bucket (see Method 1 or 2 above)
- Refresh the page and try again

### Error: "Failed to upload logo"
- Check that the `logos` bucket is set to **public** (not private)
- Ensure the image file is less than 5MB
- Supported formats: PNG, JPG, SVG, WebP

### Still having issues?
- Check your Supabase project credentials are correct
- Make sure you're using the Service Role Key (not the anon key)
- Clear browser cache and try again
