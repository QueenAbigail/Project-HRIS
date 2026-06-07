import { createClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSystemSettings } from '@/lib/system'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        position: true,
        role: true,
      },
    })

    const systemSettings = await getSystemSettings()

    return NextResponse.json({
      user,
      systemSettings,
    })
  } catch (error) {
    console.error('[v0] Error fetching user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
