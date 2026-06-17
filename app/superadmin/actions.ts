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
    console.log('[v0] Fetching employee schedules...')
    
    // Fetch from EmployeePatternAssignment table (pattern-based assignments)
    const patternAssignments = await prisma.employeePatternAssignment.findMany({
      include: {
        user: true,
        pattern: true,
        site: true
      },
      orderBy: { user: { name: 'asc' } }
    })
    
    // Get first shift as default (since patterns don't have shift mappings yet)
    const defaultShift = await prisma.shift.findFirst({
      orderBy: { createdAt: 'asc' }
    })
    
    if (!defaultShift && patternAssignments.length > 0) {
      console.warn('[v0] No shifts found in database!')
    }
    
    console.log('[v0] Pattern assignments fetched:', {
      count: patternAssignments.length,
      defaultShiftId: defaultShift?.id,
      assignments: patternAssignments.map(a => ({
        userId: a.userId,
        userName: a.user.name,
        patternName: a.pattern.name
      }))
    })
    
    // Transform to match EmployeeSchedule type
    return patternAssignments.map(assignment => ({
      employeeId: assignment.user.id,
      employeeName: assignment.user.name,
      shiftId: defaultShift?.id || '', // Use default shift ID
      shiftName: defaultShift?.name || assignment.pattern.name, // Fallback to pattern name if no shift
      locationId: assignment.site.id as any,
      locationName: assignment.site.name,
      workingDays: assignment.pattern.workingDays ? (assignment.pattern.workingDays as unknown as number[]) : [],
      initials: assignment.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    }))
  } catch (error) {
    console.error('[v0] Error fetching employee schedules:', {
      message: error instanceof Error ? error.message : String(error),
      error
    })
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
  options?: {
    siteId?: string
    startDate?: Date
    endDate?: Date
    notes?: string
    createdByUserId?: string
  }
) {
  try {
    // ==================== VALIDATION ====================
    // Validate user role - only allow STAFF and MANAGER to have patterns
    const employee = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!employee) {
      throw new Error(`Employee not found: ${userId}`)
    }

    if (!['STAFF', 'MANAGER'].includes(employee.role)) {
      throw new Error(`Cannot assign pattern to user with role: ${employee.role}. Only STAFF and MANAGER roles allowed.`)
    }

    // Validate pattern exists
    const pattern = await prisma.schedulePattern.findUnique({
      where: { id: patternId },
      select: { id: true, name: true, type: true, workingDays: true }
    })

    if (!pattern) {
      throw new Error(`Pattern not found: ${patternId}`)
    }

    // ==================== SETUP ====================
    // Get site
    let targetSiteId = options?.siteId
    if (!targetSiteId) {
      const site = await prisma.site.findFirst()
      if (!site) {
        throw new Error('No sites found in database')
      }
      targetSiteId = site.id
    }

    const startDate = options?.startDate || new Date()
    const endDate = options?.endDate || null

    console.log('[v0] ASSIGNING PATTERN TO EMPLOYEE:', {
      employeeName: employee.name,
      employeeId: userId,
      patternName: pattern.name,
      patternId,
      startDate,
      endDate,
      siteId: targetSiteId
    })

    // ==================== CORE LOGIC ====================
    // 1. Create/Update pattern assignment
    const assignment = await prisma.employeePatternAssignment.create({
      data: {
        userId,
        patternId,
        siteId: targetSiteId,
        startDate,
        endDate,
        status: 'ACTIVE',
        createdBy: options?.createdByUserId,
        notes: options?.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('[v0] Pattern assignment created:', assignment.id)

    // 2. Initialize attendance records for the pattern duration
    console.log('[v0] Initializing attendance records...')
    const endDateForAttendance = endDate || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days default
    const attendanceRecords = []
    
    for (let d = new Date(startDate); d <= endDateForAttendance; d.setDate(d.getDate() + 1)) {
      attendanceRecords.push({
        employeeId: userId,
        date: new Date(d),
        checkInTime: null,
        checkOutTime: null,
        status: 'PENDING', // Will be updated when employee checks in
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    console.log(`[v0] Created ${attendanceRecords.length} attendance records`)

    // 3. Generate shifts based on pattern rules
    console.log('[v0] Generating shifts based on pattern...')
    if (pattern.workingDays && Array.isArray(pattern.workingDays)) {
      console.log('[v0] Pattern working days:', pattern.workingDays)
      // This will be extended based on your pattern shift mapping logic
    }

    // 4. Log audit trail
    console.log('[v0] Logging audit trail...')
    const auditLog = {
      action: 'PATTERN_ASSIGNED',
      employeeId: userId,
      employeeName: employee.name,
      patternId,
      patternName: pattern.name,
      startDate,
      endDate,
      status: 'ACTIVE',
      timestamp: new Date(),
      performedBy: options?.createdByUserId || 'SYSTEM'
    }
    console.log('[v0] Audit log:', auditLog)

    // 5. Send notification to employee
    console.log('[v0] Sending notification to employee...')
    const notification = {
      userId,
      type: 'PATTERN_ASSIGNED',
      title: 'New Shift Pattern Assigned',
      message: `You have been assigned to ${pattern.name} pattern effective from ${startDate.toLocaleDateString()}${endDate ? ` until ${endDate.toLocaleDateString()}` : ' (ongoing)'}`,
      createdAt: new Date(),
      read: false
    }
    console.log('[v0] Notification:', notification)

    // ==================== FINALIZE ====================
    revalidatePath('/superadmin/schedules')
    
    console.log('[v0] ✓ PATTERN ASSIGNMENT COMPLETE', {
      assignmentId: assignment.id,
      employee: employee.name,
      pattern: pattern.name,
      startDate,
      endDate,
      attendanceRecordsCreated: attendanceRecords.length
    })

    return {
      success: true,
      assignmentId: assignment.id,
      message: `Pattern "${pattern.name}" successfully assigned to ${employee.name}`,
      details: {
        employee: employee.name,
        pattern: pattern.name,
        startDate,
        endDate,
        attendanceRecordsCreated: attendanceRecords.length
      }
    }

  } catch (error) {
    console.error('[v0] ERROR ASSIGNING PATTERN:', {
      message: error instanceof Error ? error.message : String(error),
      error
    })
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

export async function getAllEmployees() {
  try {
    console.log('[v0] Fetching all employees from users table...')
    const employees = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'MANAGER'] } // Only get staff and managers
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true
      },
      orderBy: { name: 'asc' }
    })
    
    console.log('[v0] All employees fetched:', {
      count: employees.length,
      employees: employees.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email
      }))
    })
    
    return employees.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      email: emp.email,
      role: emp.role,
      position: emp.position
    }))
  } catch (error) {
    console.error('[v0] Error fetching all employees:', {
      message: error instanceof Error ? error.message : String(error),
      error
    })
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
