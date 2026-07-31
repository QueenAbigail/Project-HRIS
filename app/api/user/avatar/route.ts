import { createAdminClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Lazy initialize Supabase admin client
let supabaseAdmin: ReturnType<typeof createSupabaseClient> | null = null

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}

export async function POST(request: NextRequest) {
  try {
    // Get Authorization header - client sends Bearer token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[v0] Avatar upload: No authorization header')
      return NextResponse.json({ error: 'Unauthorized - missing auth header' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabaseAdmin = getSupabaseAdmin()
    
    // Verify the JWT token using admin client
    let userId: string | null = null
    try {
      const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.admin.verifyJWT(token)
      if (verifyError || !verifyData?.sub) {
        console.error('[v0] Avatar upload: JWT verification failed', verifyError)
        return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
      }
      userId = verifyData.sub
      console.log('[v0] Avatar upload: Token verified for user:', userId)
    } catch (e) {
      console.error('[v0] Avatar upload: Token verification exception', e)
      return NextResponse.json({ error: 'Unauthorized - token verification failed' }, { status: 401 })
    }

    if (!userId) {
      console.error('[v0] Avatar upload: No user ID found')
      return NextResponse.json({ error: 'Unauthorized - no user id' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const filename = `${userId}-${Date.now()}-${file.name}`
    const buffer = await file.arrayBuffer()

    const supabaseAdmin = getSupabaseAdmin()
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[v0] Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filename)

    const avatarUrl = publicData.publicUrl

    // Update user avatar in database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    })

    console.log('[v0] Avatar uploaded successfully for user:', userId)
    // Return only plain string to avoid serialization issues
    return NextResponse.json({ url: avatarUrl }, { status: 200 })
  } catch (error) {
    console.error('[v0] Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}
