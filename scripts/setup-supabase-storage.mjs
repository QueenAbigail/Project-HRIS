#!/usr/bin/env node

/**
 * Setup Script for Supabase Storage Buckets
 * 
 * This script creates the necessary storage buckets in your Supabase project.
 * Run this once during initial setup:
 * 
 *   npx node scripts/setup-supabase-storage.mjs
 * 
 * You need to provide Supabase credentials via environment variables:
 *   - SUPABASE_URL: Your Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Your service role key (from Supabase dashboard)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing environment variables')
  console.error('Please set:')
  console.error('  - SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('You can find these in your Supabase dashboard under Settings > API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupBuckets() {
  console.log('🔧 Setting up Supabase storage buckets...\n')

  // Logos bucket for app branding
  try {
    console.log('📦 Creating "logos" bucket...')
    
    const { data, error } = await supabase.storage.createBucket('logos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ "logos" bucket already exists')
      } else {
        throw error
      }
    } else {
      console.log('✓ "logos" bucket created successfully')
    }
  } catch (error) {
    console.error('❌ Error creating "logos" bucket:', error.message)
    process.exit(1)
  }

  console.log('\n✅ All buckets are ready!')
  console.log('\nYou can now upload logos in the System Information page.')
}

setupBuckets().catch((error) => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})
