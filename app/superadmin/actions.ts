'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function updateSettings(formData: FormData) {
  // 1. Panggil Supabase secara resmi
  const supabase = await createClient()

  const file = formData.get('logo') as File | null
  let logoUrl = null

  // 2. Kalau ada file foto, upload ke Supabase Storage
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`

    const { error } = await supabase.storage
      .from('logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath)
      
    logoUrl = data.publicUrl
  }

  // 3. Ambil teks dari form
  const appName = formData.get('appName') as string
  const appDescription = formData.get('appDescription') as string

  // 4. Save ke Database pakai Prisma (karena kita pakai schema.prisma)
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      appName,
      appDescription,
      ...(logoUrl && { logoUrl }), // Kalau logo kosong, jangan ditimpa
    },
    create: {
      id: 'default',
      appName,
      appDescription,
      logoUrl,
    }
  })

  // 5. Refresh halaman biar logo & nama langsung ganti
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/superadmin', 'layout')
  revalidatePath('/', 'layout')
}

// Tambahkan ini di bagian paling bawah actions.ts
export async function getSystemSettings() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  })
  return settings
}

export async function getShifts() {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { id: 'asc' }
    })
    return shifts || []
  } catch (error) {
    console.error('[v0] Error fetching shifts:', error)
    // Return empty array on error instead of throwing
    return []
  }
}

export async function getEmployeeSchedules() {
  try {
    const schedules = await prisma.employeeShiftAssignment.findMany({
      include: {
        employee: true,
        shift: true,
        location: true
      },
      orderBy: { employee: { firstName: 'asc' } }
    })
    
    // Transform to match EmployeeSchedule type
    return schedules.map(schedule => ({
      employeeId: schedule.employee.id,
      employeeName: `${schedule.employee.firstName} ${schedule.employee.lastName}`,
      shiftId: schedule.shift.id,
      shiftName: schedule.shift.name,
      locationId: schedule.location.id as any,
      locationName: schedule.location.name,
      workingDays: schedule.workingDays || [],
      initials: `${schedule.employee.firstName[0]}${schedule.employee.lastName[0]}`.toUpperCase()
    }))
  } catch (error) {
    console.error('[v0] Error fetching employee schedules:', error)
    return []
  }
}

export async function createShift(data: {
  name: string
  startTime: string
  endTime: string
  gracePeriodMinutes: number
}) {
  try {
    const shift = await prisma.shift.create({
      data: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        gracePeriodMinutes: data.gracePeriodMinutes,
      }
    })
    revalidatePath('/superadmin/schedules')
    return shift
  } catch (error) {
    console.error('[v0] Error creating shift:', error)
    throw new Error('Failed to create shift')
  }
}

export async function updateShiftInDb(
  shiftId: string,
  data: {
    name?: string
    startTime?: string
    endTime?: string
    gracePeriodMinutes?: number
  }
) {
  try {
    const shift = await prisma.shift.update({
      where: { id: shiftId },
      data
    })
    revalidatePath('/superadmin/schedules')
    return shift
  } catch (error) {
    console.error('[v0] Error updating shift:', error)
    throw new Error('Failed to update shift')
  }
}

export async function deleteShiftFromDb(shiftId: string) {
  if (!shiftId) {
    throw new Error('Shift ID is required')
  }
  
  try {
    // Check if shift has assignments
    const assignments = await prisma.employeeShiftAssignment.count({
      where: { shiftId }
    })
    
    if (assignments > 0) {
      throw new Error('Cannot delete shift with assigned employees')
    }

    await prisma.shift.delete({
      where: { id: shiftId }
    })
    revalidatePath('/superadmin/schedules')
  } catch (error) {
    console.error('[v0] Error deleting shift:', error)
    throw error
  }
}

export async function assignPatternToEmployee(
  userId: string,
  patternId: string,
  siteId: string = 'default-site'
) {
  try {
    // Check if employee already has a pattern assignment
    const existing = await prisma.employeePatternAssignment.findFirst({
      where: { userId }
    })

    if (existing) {
      // Update existing assignment
      await prisma.employeePatternAssignment.update({
        where: { id: existing.id },
        data: {
          patternId,
          startDate: new Date()
        }
      })
    } else {
      // Create new pattern assignment
      await prisma.employeePatternAssignment.create({
        data: {
          userId,
          patternId,
          siteId,
          startDate: new Date()
        }
      })
    }

    revalidatePath('/superadmin/schedules')
  } catch (error) {
    console.error('[v0] Error assigning pattern to employee:', error)
    throw error
  }
}

export async function getEmployeePatterns() {
  try {
    const assignments = await prisma.employeePatternAssignment.findMany({
      include: {
        user: true,
        pattern: true,
        site: true
      }
    })
    
    return assignments || []
  } catch (error) {
    console.error('[v0] Error fetching employee patterns:', error)
    return []
  }
}

export async function getSchedulePatterns() {
  try {
    console.log('[v0] Fetching schedule patterns...')
    const patterns = await prisma.schedulePattern.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('[v0] Schedule patterns fetched:', {
      count: patterns.length,
      patterns: patterns.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        description: p.description
      }))
    })
    
    return patterns || []
  } catch (error) {
    console.error('[v0] Error fetching schedule patterns:', {
      message: error instanceof Error ? error.message : String(error),
      error: error
    })
    return []
  }
}

export async function assignEmployeeShift(
  employeeId: string,
  shiftId: string,
  locationId: string,
  workingDays: number[]
) {
  try {
    // Check if employee already has an assignment
    const existing = await prisma.employeeShiftAssignment.findFirst({
      where: { employeeId }
    })

    if (existing) {
      // Update existing assignment
      await prisma.employeeShiftAssignment.update({
        where: { id: existing.id },
        data: {
          shiftId,
          locationId,
          workingDays
        }
      })
    } else {
      // Create new assignment
      await prisma.employeeShiftAssignment.create({
        data: {
          employeeId,
          shiftId,
          locationId,
          workingDays
        }
      })
    }

    revalidatePath('/superadmin/schedules')
  } catch (error) {
    console.error('[v0] Error assigning employee shift:', error)
    throw error
  }
}
