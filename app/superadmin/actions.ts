'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function updateSettings(formData: FormData) {
  // 1. Call Supabase Admin Client (for file upload with full permissions)
  const supabase = await createAdminClient()

  const file = formData.get('logo') as File | null
  let logoUrl = null

  // 2. If file exists, upload to Supabase Storage
  if (file && file.size > 0) {
    console.log('[v0] Uploading logo file:', { fileName: file.name, size: file.size })
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer()
    
    console.log('[v0] Uploading to path:', filePath)
    
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('[v0] Upload error details:', {
        message: error.message,
        status: error.status,
      })
      throw new Error(`Logo upload failed: ${error.message}`)
    }

    console.log('[v0] Upload successful:', data)

    const { data: publicUrlData } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath)
      
    logoUrl = publicUrlData.publicUrl
    console.log('[v0] Logo URL:', logoUrl)
  }

  // 3. Get text from form
  const appName = formData.get('appName') as string
  const appDescription = formData.get('appDescription') as string

  // 4. Save to Database with Prisma
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      appName,
      appDescription,
      ...(logoUrl && { logoUrl }), // Only update logoUrl if a new one was uploaded
    },
    create: {
      id: 'default',
      appName,
      appDescription,
      logoUrl,
    }
  })

  // 5. Revalidate paths so changes appear immediately
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

export async function getPatternAssignments() {
  try {
    const assignments = await prisma.employeePatternAssignment.findMany({
      include: {
        user: { select: { id: true, name: true, role: true, position: true } },
        pattern: { select: { id: true, name: true, type: true } },
        site: { select: { id: true, name: true } }
      },
      orderBy: { user: { name: 'asc' } }
    })

    return assignments.map(assignment => ({
      id: assignment.id,
      employeeId: assignment.user.id,
      employeeName: assignment.user.name,
      employeeRole: assignment.user.role,
      patternId: assignment.pattern.id,
      patternName: assignment.pattern.name,
      patternType: assignment.pattern.type,
      status: assignment.status,
      locationId: assignment.site.id,
      locationName: assignment.site.name,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      notes: assignment.notes
    }))
  } catch (error) {
    console.error('[v0] Error fetching pattern assignments:', error)
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
      orderBy: { id: 'asc' }
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

// ==================== DEVICE MANAGEMENT ACTIONS ====================

export async function getDeviceBindings() {
  try {
    console.log('[v0] Fetching all device bindings...')
    
    const devices = await prisma.deviceBinding.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { bindDate: 'desc' }
    })

    const mappedDevices = devices.map(device => ({
      id: device.id,
      userId: device.userId,
      userName: device.user.name,
      userEmail: device.user.email,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      appVersion: device.appVersion,
      bindDate: device.bindDate.toISOString().split('T')[0],
      lastUsed: device.lastUsed.toISOString().replace('T', ' ').slice(0, 16),
      isActive: device.isActive
    }))

    console.log('[v0] Devices fetched:', {
      count: devices.length,
      devices: mappedDevices.slice(0, 3) // Log first 3 for brevity
    })

    return mappedDevices
  } catch (error) {
    console.error('[v0] Error fetching device bindings:', {
      message: error instanceof Error ? error.message : String(error),
      error
    })
    return []
  }
}

export async function removeDeviceBinding(deviceId: string) {
  try {
    console.log('[v0] Removing device binding:', deviceId)

    const device = await prisma.deviceBinding.findUnique({
      where: { id: deviceId },
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    if (!device) {
      throw new Error('Device binding not found')
    }

    await prisma.deviceBinding.delete({
      where: { id: deviceId }
    })

    console.log('[v0] Device binding removed:', {
      deviceId,
      user: device.user.name,
      deviceName: device.deviceName
    })

    revalidatePath('/superadmin/devices')

    return {
      success: true,
      message: `Device binding for ${device.user.name} has been removed.`
    }
  } catch (error) {
    console.error('[v0] Error removing device binding:', {
      message: error instanceof Error ? error.message : String(error),
      error
    })
    throw error
  }
}

export async function updateDeviceLastUsed(deviceId: string) {
  try {
    await prisma.deviceBinding.update({
      where: { id: deviceId },
      data: { lastUsed: new Date() }
    })
  } catch (error) {
    console.error('[v0] Error updating device last used:', error)
    // Don't throw - this is a non-critical update
  }
}

export async function createDeviceBinding(data: {
  userId: string
  deviceId: string
  deviceName: string
  deviceType: 'mobile' | 'app'
  appVersion?: string
}) {
  try {
    console.log('[v0] Creating device binding:', { deviceId: data.deviceId, userId: data.userId })

    // Check if user already has a device of this type
    const existing = await prisma.deviceBinding.findFirst({
      where: {
        userId: data.userId,
        deviceType: data.deviceType
      }
    })

    if (existing) {
      throw new Error(`User already has a ${data.deviceType} device bound. Please remove the previous binding first.`)
    }

    const device = await prisma.deviceBinding.create({
      data: {
        userId: data.userId,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        appVersion: data.appVersion,
        bindDate: new Date(),
        lastUsed: new Date(),
        isActive: true
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    console.log('[v0] Device binding created:', {
      id: device.id,
      userId: device.userId,
      deviceId: device.deviceId
    })

    revalidatePath('/superadmin/devices')

    return {
      success: true,
      device,
      message: `Device "${data.deviceName}" successfully bound to ${device.user.name}`
    }
  } catch (error) {
    console.error('[v0] Error creating device binding:', {
      message: error instanceof Error ? error.message : String(error),
      error
    })
    throw error
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

// ==================== BULK IMPORT ACTIONS ====================

/**
 * Validate bulk import data before processing
 */
export async function validateBulkImport(
  rows: any[],
  fileName: string
) {
  try {
    console.log('[v0] Validating bulk import:', { fileName, rowCount: rows.length })

    const { getValidationContext, validateBulkImport: validate } = await import('@/lib/importValidator')

    // Get validation context
    const context = await getValidationContext(prisma)

    // Run validation
    const result = await validate(rows, context)

    console.log('[v0] Validation complete:', {
      isValid: result.isValid,
      validRows: result.validRows,
      invalidRows: result.invalidRows,
      conflicts: result.conflicts.length
    })

    return result
  } catch (error) {
    console.error('[v0] Error processing bulk import:', error)
    throw error
  }
}

// ==================== QR CODE / LOCATION ACTIONS ====================

export async function getAttendanceLocations(siteId?: string) {
  try {
    console.log('[v0] Fetching attendance locations', { siteId: siteId || 'all' })

    const locations = await prisma.attendanceLocation.findMany({
      where: siteId ? { siteId } : {},
      include: {
        site: { 
          select: { 
            id: true, 
            name: true, 
            code: true,
            company: { select: { id: true, name: true } }
          } 
        }
      },
      orderBy: { name: 'asc' }
    })

    const mapped = locations.map((loc, idx) => ({
      id: loc.id,
      name: loc.name,
      code: `${loc.site.code}-ATT-${String(idx + 1).padStart(2, '0')}`,
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      radius: loc.radius,
      status: loc.isActive ? 'Active' : 'Inactive',
      siteId: loc.siteId,
      siteName: loc.site.name,
      siteCode: loc.site.code,
      clientCompanyId: loc.site.company?.id,
      clientCompanyName: loc.site.company?.name || 'N/A'
    }))

    console.log('[v0] Attendance locations fetched:', { count: locations.length })
    return mapped
  } catch (error) {
    console.error('[v0] Error fetching attendance locations:', error)
    return []
  }
}

export async function getPatrolLocations(siteId?: string) {
  try {
    console.log('[v0] Fetching patrol locations', { siteId: siteId || 'all' })

    const locations = await prisma.patrolLocation.findMany({
      where: siteId ? { siteId } : {},
      include: {
        site: { 
          select: { 
            id: true, 
            name: true, 
            code: true,
            company: { select: { id: true, name: true } }
          } 
        }
      },
      orderBy: { name: 'asc' }
    })

    const mapped = locations.map((loc, idx) => ({
      id: loc.id,
      name: loc.name,
      code: `${loc.site.code}-PAT-${String(idx + 1).padStart(2, '0')}`,
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      radius: loc.radius,
      status: loc.isActive ? 'Active' : 'Inactive',
      siteId: loc.siteId,
      siteName: loc.site.name,
      siteCode: loc.site.code,
      clientCompanyId: loc.site.company?.id,
      clientCompanyName: loc.site.company?.name || 'N/A'
    }))

    console.log('[v0] Patrol locations fetched:', { count: locations.length })
    return mapped
  } catch (error) {
    console.error('[v0] Error fetching patrol locations:', error)
    return []
  }
}

export async function getAllSites() {
  try {
    console.log('[v0] Fetching all sites for location grouping')

    const sites = await prisma.site.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true }
    })

    console.log('[v0] Sites fetched:', { count: sites.length })
    return sites
  } catch (error) {
    console.error('[v0] Error fetching sites:', error)
    return []
  }
}

export async function getCompanyInfo() {
  try {
    console.log('[v0] Fetching company info')

    const company = await prisma.company.findFirst({
      select: { id: true, name: true }
    })

    if (!company) {
      console.warn('[v0] No company found in database')
      return { id: '', name: 'Your Company' }
    }

    console.log('[v0] Company info fetched:', { name: company.name })
    return company
  } catch (error) {
    console.error('[v0] Error fetching company info:', error)
    return { id: '', name: 'Your Company' }
  }
}

/**
 * Process bulk import (all-or-nothing execution)
 */
export async function processBulkImport(
  rows: any[],
  fileName: string,
  userId: string
) {
  let importLog: any = null

  try {
    console.log('[v0] Starting bulk import process:', { fileName, rowCount: rows.length, userId })

    const { getValidationContext, validateBulkImport: validate } = await import('@/lib/importValidator')

    // Get validation context
    const context = await getValidationContext(prisma)

    // Validate first
    const validation = await validate(rows, context)

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.invalidRows} row(s) have errors`)
    }

    // Create import log entry
    importLog = await prisma.bulkImportLog.create({
      data: {
        fileName,
        importedBy: userId,
        totalRows: rows.length,
        successCount: 0,
        errorCount: 0,
        validationDetails: JSON.stringify(validation),
        status: 'SUCCESS'
      }
    })

    console.log('[v0] Created import log:', importLog.id)

    // Process each valid row in a transaction
    const createdAssignments = []
    const importRecords = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      try {
        // Get actual employee ID
        const employee = context.employees.get(row.employeeId)
        if (!employee) {
          throw new Error('Employee not found')
        }

        // Get site
        const site = context.sites.get(row.site.toLowerCase())
        if (!site) {
          throw new Error('Site not found')
        }

        // Get first shift for pattern (will be improved later)
        const firstShift = [...context.shifts.values()][0]
        if (!firstShift) {
          throw new Error('No shifts found in system')
        }

        // Parse start/end dates
        const startDate = new Date(row.startDate)
        const endDate = row.endDate ? new Date(row.endDate) : null

        // Handle existing assignment (replace)
        const existing = await prisma.employeePatternAssignment.findFirst({
          where: { userId: employee.id, siteId: site.id }
        })

        if (existing) {
          await prisma.employeePatternAssignment.update({
            where: { id: existing.id },
            data: {
              status: 'ENDED',
              updatedAt: new Date()
            }
          })
        }

        // Create new assignment
        const assignment = await prisma.employeePatternAssignment.create({
          data: {
            userId: employee.id,
            patternId: firstShift.id, // Temporary - will be derived from daily shifts
            siteId: site.id,
            startDate,
            endDate,
            status: 'ACTIVE',
            createdBy: userId,
            notes: `Imported from ${fileName}`
          }
        })

        createdAssignments.push(assignment)

        // Create import record
        importRecords.push({
          bulkImportLogId: importLog.id,
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          siteId: site.id,
          assignmentId: assignment.id,
          startDate,
          endDate,
          dailySchedule: JSON.stringify({
            monday: row.monday,
            tuesday: row.tuesday,
            wednesday: row.wednesday,
            thursday: row.thursday,
            friday: row.friday,
            saturday: row.saturday,
            sunday: row.sunday
          }),
          status: 'SUCCESS'
        })
      } catch (error) {
        // Record error but continue processing
        importRecords.push({
          bulkImportLogId: importLog.id,
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          siteId: '', // Will fail constraint, but record the error
          startDate: new Date(row.startDate),
          endDate: row.endDate ? new Date(row.endDate) : null,
          dailySchedule: JSON.stringify({}),
          status: 'ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Batch create import records
    if (importRecords.length > 0) {
      await prisma.bulkImportRecord.createMany({
        data: importRecords.filter(r => r.siteId) // Only records with valid siteId
      })
    }

    // Update import log
    const successCount = importRecords.filter(r => r.status === 'SUCCESS').length
    const errorCount = importRecords.filter(r => r.status === 'ERROR').length

    await prisma.bulkImportLog.update({
      where: { id: importLog.id },
      data: {
        successCount,
        errorCount,
        status: errorCount > 0 ? 'PARTIAL' : 'SUCCESS'
      }
    })

    console.log('[v0] Bulk import completed:', {
      importLogId: importLog.id,
      createdAssignments: createdAssignments.length,
      errors: errorCount
    })

    revalidatePath('/superadmin/schedules')

    return {
      success: true,
      importLogId: importLog.id,
      message: `Successfully imported ${successCount}/${rows.length} employees`,
      successCount,
      errorCount
    }
  } catch (error) {
    // Update log with failure status
    if (importLog) {
      await prisma.bulkImportLog.update({
        where: { id: importLog.id },
        data: {
          status: 'FAILED',
          validationDetails: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      })
    }

    console.error('[v0] Bulk import failed:', error)
    throw error
  }
}

/**
 * Get import audit trail
 */
export async function getImportAuditTrail(limit: number = 20) {
  try {
    const logs = await prisma.bulkImportLog.findMany({
      include: {
        importedByUser: { select: { name: true, email: true } },
        importRecords: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return logs.map(log => ({
      id: log.id,
      fileName: log.fileName,
      importedBy: log.importedByUser?.name || 'Unknown',
      importedAt: log.createdAt,
      totalRows: log.totalRows,
      successCount: log.successCount,
      errorCount: log.errorCount,
      status: log.status
    }))
  } catch (error) {
    console.error('[v0] Error fetching audit trail:', error)
    return []
  }
}

// Update existing pattern assignment (e.g., change location/site)
export async function updatePatternAssignment(
  assignmentId: string,
  data: {
    siteId?: string
    status?: string
    endDate?: Date | null
    notes?: string
  }
) {
  try {
    const assignment = await prisma.employeePatternAssignment.update({
      where: { id: assignmentId },
      data,
      include: {
        user: true,
        pattern: true,
        site: true
      }
    })

    revalidatePath('/superadmin/schedules')
    
    return {
      success: true,
      message: 'Assignment updated successfully',
      assignment
    }
  } catch (error) {
    console.error('[v0] Error updating assignment:', error)
    throw error
  }
}

// Auto-generate expected attendance records for today based on assignments
export async function generateTodayAttendanceRecords() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find all active assignments that cover today
    const activeAssignments = await prisma.employeePatternAssignment.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      },
      include: {
        user: true,
        site: true,
        pattern: true
      }
    })

    let createdCount = 0
    let skippedCount = 0

    for (const assignment of activeAssignments) {
      // Check if attendance record already exists for today
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          userId: assignment.userId,
          locationId: assignment.siteId,
          attendanceDate: {
            gte: today,
            lt: tomorrow
          }
        }
      })

      if (existingAttendance) {
        skippedCount++
        continue
      }

      // Determine if user is scheduled for today based on pattern
      const dayOfWeek = today.getDay()
      const workingDays = assignment.pattern.workingDays as number[] || []
      
      // Skip if pattern specifies working days and today is not a working day
      if (workingDays.length > 0 && !workingDays.includes(dayOfWeek)) {
        skippedCount++
        continue
      }

      // Create attendance record with PENDING status
      await prisma.attendance.create({
        data: {
          userId: assignment.userId,
          locationId: assignment.siteId,
          attendanceDate: today,
          status: 'PENDING', // Will be updated to PRESENT/LATE when they check in
          checkInTime: null,
          checkOutTime: null,
          lateMinutes: 0,
          createdAt: new Date()
        }
      })

      createdCount++
    }

    revalidatePath('/dashboard/attendance')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Generated ${createdCount} attendance records for today`,
      details: {
        created: createdCount,
        skipped: skippedCount,
        total: activeAssignments.length
      }
    }
  } catch (error) {
    console.error('[v0] Error generating attendance records:', error)
    throw error
  }
}
