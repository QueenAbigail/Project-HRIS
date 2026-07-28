import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst()
    // Return default settings if none found
    if (!settings) {
      return NextResponse.json({
        logoUrl: null,
        appName: 'HR Administration',
        appDescription: 'HR Administration System'
      })
    }
    return NextResponse.json({
      logoUrl: settings.logoUrl,
      appName: settings.appName,
      appDescription: settings.appDescription
    })
  } catch (error) {
    // Return defaults on error instead of 500
    console.error('[v0] System settings error:', error)
    return NextResponse.json({
      logoUrl: null,
      appName: 'HR Administration',
      appDescription: 'HR Administration System'
    })
  }
}
