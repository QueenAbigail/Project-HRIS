import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const date = searchParams.get('date')

    if (!employeeId || !date) {
      return NextResponse.json(
        { error: 'Missing employeeId or date' },
        { status: 400 }
      )
    }

    // Parse the date
    const parsedDate = new Date(date)

    // Check if attendance record exists for this employee and date
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: employeeId,
          date: parsedDate,
        },
      },
      select: {
        actualCheckIn: true,
        actualCheckOut: true,
      },
    })

    if (!attendance) {
      return NextResponse.json({ hasCheckIn: false, hasCheckOut: false })
    }

    // Return whether check-in/check-out times exist
    return NextResponse.json({
      hasCheckIn: !!attendance.actualCheckIn,
      hasCheckOut: !!attendance.actualCheckOut,
      checkInTime: attendance.actualCheckIn
        ? new Date(attendance.actualCheckIn).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        : undefined,
      checkOutTime: attendance.actualCheckOut
        ? new Date(attendance.actualCheckOut).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
        : undefined,
    })
  } catch (error) {
    console.error('[v0] Failed to check attendance:', error)
    return NextResponse.json({ error: 'Failed to check attendance' }, { status: 500 })
  }
}
