import { createClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

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

    // Upload to Vercel Blob
    const filename = `${data.user.email}-${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { email: data.user.email },
      data: { avatar: blob.url },
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
