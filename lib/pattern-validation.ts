/**
 * Pattern validation utilities for schedule pattern assignments
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface PatternData {
  id?: string
  name: string
  type: 'FIXED' | 'ROTATING' | 'MODULO'
  workingDays?: number[]
  rotatingPattern?: {
    sequence: { days: number; shiftType: string }[]
    startDate: string
  }
  moduloPattern?: {
    sequence: string[]
    startDate: string
  }
}

export interface AssignmentData {
  employeeId: string
  patternId: string
  startDate: Date
  endDate?: Date | null
  pattern?: PatternData
}

/**
 * Validate a shift pattern configuration
 */
export function validatePattern(pattern: PatternData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic validations
  if (!pattern.name || pattern.name.trim() === '') {
    errors.push('Pattern name is required')
  }

  if (!pattern.type) {
    errors.push('Pattern type is required')
  }

  // Type-specific validations
  if (pattern.type === 'FIXED') {
    if (!pattern.workingDays || pattern.workingDays.length === 0) {
      errors.push('FIXED patterns must have at least one working day')
    } else {
      // Validate day numbers
      const invalidDays = pattern.workingDays.filter((d) => d < 0 || d > 6)
      if (invalidDays.length > 0) {
        errors.push('Working days must be between 0 (Sunday) and 6 (Saturday)')
      }
      if (pattern.workingDays.length === 7) {
        warnings.push('Pattern has all 7 days as working days - employees will work every day')
      }
    }
  } else if (pattern.type === 'ROTATING') {
    if (!pattern.rotatingPattern) {
      errors.push('ROTATING patterns must have rotation configuration')
    } else {
      if (!pattern.rotatingPattern.sequence || pattern.rotatingPattern.sequence.length === 0) {
        errors.push('ROTATING pattern must have at least one sequence item')
      } else {
        pattern.rotatingPattern.sequence.forEach((item, idx) => {
          if (item.days <= 0) {
            errors.push(`Sequence item ${idx + 1}: days must be greater than 0`)
          }
          if (!item.shiftType || !['morning', 'night', 'off'].includes(item.shiftType)) {
            errors.push(`Sequence item ${idx + 1}: invalid shift type`)
          }
        })
      }
      
      if (!pattern.rotatingPattern.startDate) {
        errors.push('ROTATING pattern must have a start date')
      } else {
        const startDate = new Date(pattern.rotatingPattern.startDate)
        if (isNaN(startDate.getTime())) {
          errors.push('ROTATING pattern has an invalid start date')
        }
      }
    }
  } else if (pattern.type === 'MODULO') {
    if (!pattern.moduloPattern) {
      errors.push('MODULO patterns must have modulo configuration')
    } else {
      if (!pattern.moduloPattern.sequence || pattern.moduloPattern.sequence.length === 0) {
        errors.push('MODULO pattern must have at least one sequence item')
      } else {
        pattern.moduloPattern.sequence.forEach((item, idx) => {
          if (!['morning', 'night', 'off', 'rest'].includes(item.toLowerCase())) {
            errors.push(`Sequence item ${idx + 1}: invalid shift type '${item}'`)
          }
        })
        const totalDays = pattern.moduloPattern.sequence.length
        if (totalDays > 30) {
          warnings.push(`Pattern cycle is ${totalDays} days - ensure this is intentional`)
        }
      }

      if (!pattern.moduloPattern.startDate) {
        errors.push('MODULO pattern must have a start date')
      } else {
        const startDate = new Date(pattern.moduloPattern.startDate)
        if (isNaN(startDate.getTime())) {
          errors.push('MODULO pattern has an invalid start date')
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate a pattern assignment
 */
export function validateAssignment(assignment: AssignmentData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic validations
  if (!assignment.employeeId) {
    errors.push('Employee is required')
  }

  if (!assignment.patternId) {
    errors.push('Pattern is required')
  }

  if (!assignment.startDate) {
    errors.push('Start date is required')
  } else {
    const startDate = new Date(assignment.startDate)
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date')
    }

    // Warning if start date is in the past
    if (startDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      warnings.push('Start date is in the past - attendance may not be generated for past dates')
    }
  }

  // Validate end date if provided
  if (assignment.endDate) {
    const endDate = new Date(assignment.endDate)
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date')
    } else if (assignment.startDate && endDate <= new Date(assignment.startDate)) {
      errors.push('End date must be after start date')
    } else if (endDate < new Date()) {
      warnings.push('End date is in the past')
    }
  }

  // Validate pattern if included
  if (assignment.pattern) {
    const patternValidation = validatePattern(assignment.pattern)
    if (!patternValidation.isValid) {
      errors.push('Associated pattern has validation errors')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(validation: ValidationResult): string {
  if (validation.isValid) return ''
  
  const message = [
    validation.errors.length > 0 && `Errors:\n${validation.errors.map(e => `• ${e}`).join('\n')}`,
    validation.warnings.length > 0 && `Warnings:\n${validation.warnings.map(w => `⚠️ ${w}`).join('\n')}`
  ]
    .filter(Boolean)
    .join('\n\n')
  
  return message
}
