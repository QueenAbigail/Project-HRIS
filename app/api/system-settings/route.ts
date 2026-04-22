import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst()
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }
    return NextResponse.json({
      logoUrl: settings.logoUrl,
      appName: settings.appName,
      appDescription: settings.appDescription
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
