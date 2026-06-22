# Fix Logo Upload RLS Error

Your Supabase Storage `logos` bucket has **Row Level Security (RLS)** enabled, which is blocking file uploads.

## Quick Fix (5 minutes)

Go to your Supabase Dashboard and follow these steps:

### Step 1: Open Storage Policies
1. Go to https://app.supabase.com/
2. Select your project
3. Click **Storage** → **Buckets**
4. Click on the **`logos`** bucket
5. Click the **Policies** tab

### Step 2: Disable RLS (Easiest for Development)
1. Look for the toggle at the top of the Policies section
2. Click **Disable RLS** (if you see this option)
3. This allows anyone with your Supabase credentials to upload

OR

### Step 3: Add Authenticated Upload Policy (More Secure)
If you don't see a disable button:
1. Click **Create policy**
2. Select **For authenticated users only**
3. Choose operation: **INSERT**
4. Click **Review** → **Save policy**
5. Click **Create policy** again
6. Select **For authenticated users only**
7. Choose operation: **SELECT**
8. Click **Review** → **Save policy**

## After Fixing RLS

Go back to your app and try uploading the logo again. It should work now!

## Why This Happens

RLS (Row Level Security) is a security feature that restricts database access. When enabled on a storage bucket without proper policies, it blocks all uploads. For a development environment or internal tool, disabling RLS is often acceptable. For production, you'd want to add proper authentication policies.
