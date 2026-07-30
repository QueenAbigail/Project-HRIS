import { createClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Lazy initialize Supabase client
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
    const auth = await createClient()
    const { data } = await auth.api.getSession()

    if (!data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const supabase = getSupabaseAdmin()
    const filename = `${data.user.id}-${Date.now()}-${file.name}`
    const buffer = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabase.storage
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
    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)

    const avatarUrl = publicData.publicUrl

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { email: data.user.email },
      data: { avatar: avatarUrl },
      select: { avatar: true },
    })

    return NextResponse.json({ url: updatedUser.avatar }, { status: 200 })
  } catch (error) {
    console.error('[v0] Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}
