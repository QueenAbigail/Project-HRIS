/**
 * Validation Engine for bulk import
 * Validates each row against business rules
 */

import type { ParsedImportRow } from './importParser'

export interface ValidationError {
  rowIndex: number
  employeeId: string
  errors: string[]
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  totalRows: number
  validRows: number
  invalidRows: number
  errors: ValidationError[]
  conflicts: ConflictRecord[]
}

export interface ConflictRecord {
  rowIndex: number
  employeeId: string
  existingPatternName: string
  newPatternName: string
  action: 'replace'
}

/**
 * Context needed for validation
 */
export interface ValidationContext {
  employees: Map<string, { id: string; name: string; role: string }>
  sites: Map<string, { id: string; name: string }>
  shifts: Map<string, { id: string; name: string }>
  patterns: Map<string, { id: string; name: string; type: string }>
  existingAssignments: Map<string, { patternId: string; patternName: string }>
}

/**
 * Main validation function
 */
export async function validateBulkImport(
  rows: ParsedImportRow[],
  context: ValidationContext
): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const conflicts: ConflictRecord[] = []
  const processedEmployeeIds = new Set<string>()
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowErrors: string[] = []
    
    // Check for duplicate employee IDs within import file
    if (processedEmployeeIds.has(row.employeeId)) {
      rowErrors.push('Duplicate Employee ID in import file')
    }
    processedEmployeeIds.add(row.employeeId)
    
    // Validate employee exists
    if (!context.employees.has(row.employeeId)) {
      rowErrors.push(`Employee ID not found: "${row.employeeId}"`)
    } else {
      const employee = context.employees.get(row.employeeId)!
      
      // Verify employee name if provided
      if (row.employeeName && row.employeeName.toLowerCase() !== employee.name.toLowerCase()) {
        rowErrors.push(
          `Employee name mismatch: File says "${row.employeeName}", System has "${employee.name}"`
        )
      }
    }
    
    // Validate site exists
    if (!context.sites.has(row.site)) {
      rowErrors.push(`Site not found: "${row.site}"`)
    }
    
    // Validate dates
    const startDate = new Date(row.startDate)
    if (isNaN(startDate.getTime())) {
      rowErrors.push(`Invalid Start Date: "${row.startDate}"`)
    }
    
    if (row.endDate) {
      const endDate = new Date(row.endDate)
      if (isNaN(endDate.getTime())) {
        rowErrors.push(`Invalid End Date: "${row.endDate}"`)
      } else if (endDate <= startDate) {
        rowErrors.push('End Date must be after Start Date')
      }
    }
    
    // Validate daily shifts
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dailyShifts: string[] = []
    let hasDailySchedule = false
    
    for (const day of daysOfWeek) {
      const shift = row[day]
      if (shift) {
        hasDailySchedule = true
        if (!context.shifts.has(shift)) {
          rowErrors.push(`Shift not found for ${day}: "${shift}"`)
        } else {
          dailyShifts.push(shift)
        }
      }
    }
    
    // Must have either daily schedule or pattern name
    if (!hasDailySchedule) {
      rowErrors.push('No daily shifts specified (Monday-Sunday). At least one shift is required.')
    }
    
    // Check for existing assignment (conflict)
    const existingAssignment = context.existingAssignments.get(row.employeeId)
    if (existingAssignment) {
      conflicts.push({
        rowIndex: i,
        employeeId: row.employeeId,
        existingPatternName: existingAssignment.patternName,
        newPatternName: dailyShifts.join(', ') || 'Unknown',
        action: 'replace'
      })
    }
    
    // Add error record if any errors found
    if (rowErrors.length > 0) {
      errors.push({
        rowIndex: i,
        employeeId: row.employeeId,
        errors: rowErrors,
        severity: 'error'
      })
    }
  }
  
  const validRows = rows.length - errors.length
  
  return {
    isValid: errors.length === 0,
    totalRows: rows.length,
    validRows,
    invalidRows: errors.length,
    errors,
    conflicts
  }
}

/**
 * Get validation context from database
 */
export async function getValidationContext(
  prisma: any // PrismaClient
): Promise<ValidationContext> {
  // Fetch all employees
  const employees = await prisma.user.findMany({
    select: { id: true, employeeCode: true, name: true, role: true }
  })
  
  // Fetch all sites
  const sites = await prisma.site.findMany({
    select: { id: true, name: true }
  })
  
  // Fetch all shifts
  const shifts = await prisma.shift.findMany({
    select: { id: true, name: true }
  })
  
  // Fetch all patterns
  const patterns = await prisma.schedulePattern.findMany({
    select: { id: true, name: true, type: true }
  })
  
  // Fetch existing assignments
  const assignments = await prisma.employeePatternAssignment.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true, pattern: true }
  })
  
  // Build maps for O(1) lookup
  const employeeMap = new Map<string, { id: string; name: string; role: string }>()
  employees.forEach(emp => {
    if (emp.employeeCode) {
      employeeMap.set(emp.employeeCode, {
        id: emp.id,
        name: emp.name,
        role: emp.role
      })
    }
  })
  
  const siteMap = new Map<string, { id: string; name: string }>()
  sites.forEach(site => {
    siteMap.set(site.name.toLowerCase(), { id: site.id, name: site.name })
  })
  
  const shiftMap = new Map<string, { id: string; name: string }>()
  shifts.forEach(shift => {
    shiftMap.set(shift.name.toLowerCase(), { id: shift.id, name: shift.name })
  })
  
  const patternMap = new Map<string, { id: string; name: string; type: string }>()
  patterns.forEach(pattern => {
    patternMap.set(pattern.name.toLowerCase(), { id: pattern.id, name: pattern.name, type: pattern.type })
  })
  
  const assignmentMap = new Map<string, { patternId: string; patternName: string }>()
  assignments.forEach(assignment => {
    assignmentMap.set(assignment.user.employeeCode || assignment.user.id, {
      patternId: assignment.pattern.id,
      patternName: assignment.pattern.name
    })
  })
  
  return {
    employees: employeeMap,
    sites: siteMap,
    shifts: shiftMap,
    patterns: patternMap,
    existingAssignments: assignmentMap
  }
}
