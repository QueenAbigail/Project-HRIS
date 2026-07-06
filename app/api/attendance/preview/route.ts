import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, patternId, startDate, previewDays = 30 } = body

    if (!employeeId || !patternId || !startDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch employee and pattern data
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { id: true, name: true }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    const pattern = await prisma.schedulePattern.findUnique({
      where: { id: patternId },
      select: { id: true, name: true, type: true, workingDays: true, rotatingPattern: true, moduloPattern: true }
    })

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      )
    }

    // Generate 30-day preview
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    const scheduledDays = []
    let scheduledCount = 0
    let offCount = 0

    for (let i = 0; i < previewDays; i++) {
      const currentDate = new Date(start)
      currentDate.setDate(currentDate.getDate() + i)
      
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        currentDate.getDay()
      ]
      const dateString = currentDate.toISOString().split('T')[0]
      const dayNum = currentDate.getDay()

      let isScheduled = true
      let shiftType = 'morning'

      // Determine if scheduled based on pattern type
      if (pattern.type === 'FIXED') {
        const workingDays = (pattern.workingDays as number[]) || []
        isScheduled = workingDays.length === 0 || workingDays.includes(dayNum)
      } else if (pattern.type === 'ROTATING') {
        const rotatingData = pattern.rotatingPattern as any
        if (rotatingData?.sequence && rotatingData?.startDate) {
          const patternStartDate = new Date(rotatingData.startDate)
          const daysFromStart = Math.floor(
            (currentDate.getTime() - patternStartDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          const sequenceIndex = daysFromStart % rotatingData.sequence.length
          const currentCycle = rotatingData.sequence[sequenceIndex]
          isScheduled = currentCycle.days > 0
          shiftType = currentCycle.shiftType || 'morning'
        }
      } else if (pattern.type === 'MODULO') {
        const moduloData = pattern.moduloPattern as any
        if (moduloData?.sequence && moduloData?.startDate) {
          const patternStartDate = new Date(moduloData.startDate)
          const daysFromStart = Math.floor(
            (currentDate.getTime() - patternStartDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          const sequenceIndex = daysFromStart % moduloData.sequence.length
          const currentShiftType = moduloData.sequence[sequenceIndex]
          isScheduled = currentShiftType !== 'rest' && currentShiftType !== 'OFF'
          shiftType = currentShiftType
        }
      }

      if (isScheduled) scheduledCount++
      else offCount++

      scheduledDays.push({
        date: dateString,
        dayOfWeek,
        isScheduled,
        shiftType: isScheduled ? shiftType : undefined,
        reason: !isScheduled ? 'Off' : undefined
      })
    }

    return NextResponse.json({
      employeeName: employee.name,
      patternName: pattern.name,
      patternType: pattern.type,
      startDate: start.toISOString(),
      previewDays,
      scheduledDays,
      summary: {
        totalDays: previewDays,
        scheduledDays: scheduledCount,
        offDays: offCount
      }
    })
  } catch (error) {
    console.error('[v0] Error generating attendance preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
