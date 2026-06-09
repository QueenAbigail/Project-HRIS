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
  try {
    // Check if shift has assignments
    const assignments = await prisma.employeeSchedule.count({
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
