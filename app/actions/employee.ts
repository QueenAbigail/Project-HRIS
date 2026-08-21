'use server'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function friendlyEmployeeError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const invalidField = message.match(/^INVALID_EMPLOYEE_FIELD:(.+)$/)

  if (invalidField) {
    return `Please enter a valid ${invalidField[1].trim()}.`
  }

  if (/Invalid (?:[A-Za-z ]+ )?Date|Expected Date object|Invalid value for argument.*Date/i.test(message)) {
    const dateField = message.match(/argument [`'](joinDate|birthDate|ktaExpiry)[`']/i)?.[1]
    const dateLabels: Record<string, string> = {
      joinDate: 'Join Date',
      birthDate: 'Birth Date',
      ktaExpiry: 'KTA Expiry',
    }
    return dateField
      ? `Please enter a valid ${dateLabels[dateField]}.`
      : 'Please check the Join Date, Birth Date, or KTA Expiry field and enter a valid date.'
  }

  const argumentField = message.match(/Argument [`']([A-Za-z0-9_]+)[`']/i)?.[1]
  if (argumentField) {
    const labels: Record<string, string> = {
      name: 'Name', email: 'Email', personalEmail: 'Personal Email', department: 'Department',
      position: 'Position', siteId: 'Location', companyId: 'Company', joinDate: 'Join Date',
      birthDate: 'Birth Date', ktaExpiry: 'KTA Expiry', employmentStatus: 'Employment Status',
    }
    if (labels[argumentField]) return `Please check the ${labels[argumentField]} field.`
  }

  if (/already registered|already been registered|user already exists|email.*already/i.test(message)) {
    return 'This employee ID is already registered. Please use a different Employee Code.'
  }

  if (/invalid email|email address is invalid|email.*valid/i.test(message)) {
    return 'Please check the Employee Code. It is used to create the employee login email and must be valid.'
  }

  if (/password/i.test(message) && /weak|short|characters|invalid/i.test(message)) {
    return 'The default login password does not meet the security requirements. Please contact an administrator.'
  }

  if (/Unique constraint failed/i.test(message)) {
    if (/email/i.test(message)) return 'This login email is already used by another employee. Please use a different Employee Code.'
    if (/employeeCode|hrisEmail/i.test(message)) return 'This Employee Code is already used by another employee.'
    if (/ktp|npwp|bpjs|kta/i.test(message)) return 'One of the employee identification numbers is already used by another employee.'
    return 'Some employee information is already in use. Please check the Employee Code and identification numbers.'
  }

  if (/Foreign key constraint failed|site/i.test(message)) {
    return 'This employee could not be found. Please refresh the page and try again.'
  }

  if (/INVALID_SITE_COMPANY/i.test(message)) {
    return 'The selected location is not linked to a company. Please ask an administrator to fix the site setup.'
  }

  if (/INVALID_SITE/i.test(message)) {
    return 'The selected location is no longer available. Please choose another location.'
  }

  if (/Foreign key constraint failed|site/i.test(message)) {
    return 'The selected location or company is no longer available. Please choose another location.'
  }

  return 'Unable to save employee data. Please review the form and try again.'
}

function parseEmployeeDate(value: unknown, label: string): Date | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) return null
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(String(value))
  if (Number.isNaN(date.getTime())) throw new Error(`INVALID_EMPLOYEE_FIELD:${label}`)
  return date
}

// ==========================================
// 1. ACTION BUAT UPDATE EMPLOYEE
// ==========================================
export async function updateEmployeeAction(userId: string, formData: any) {
  try {
    console.log('[v0] Update employee called with data keys:', Object.keys(formData))

    // 1. Update password if provided
    if (formData.password && formData.password.trim() !== '') {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: formData.password }
      )
      if (authError) throw new Error("Gagal update password: " + authError.message)
    }

    // 2. Build update data - only include valid schema fields
    const updateData: any = {}

    // Map form fields to schema fields with type handling
    const fieldMap = {
      name: { field: 'name', type: 'string' },
      email: { field: 'email', type: 'string' },
      personalEmail: { field: 'personalEmail', type: 'string' },
      initials: { field: 'initials', type: 'string' },
      department: { field: 'department', type: 'string' },
      position: { field: 'position', type: 'string' },
      phoneNumber: { field: 'phoneNumber', type: 'string' },
      ktpNumber: { field: 'ktpNumber', type: 'string' },
      address: { field: 'address', type: 'string' },
      birthCity: { field: 'birthCity', type: 'string' },
      birthDate: { field: 'birthDate', type: 'date' },
      bpjsNumber: { field: 'bpjsNumber', type: 'string' },
      gender: { field: 'gender', type: 'string' },
      maritalStatus: { field: 'maritalStatus', type: 'string' },
      religion: { field: 'religion', type: 'string' },
      bloodType: { field: 'bloodType', type: 'string' },
      npwpNumber: { field: 'npwpNumber', type: 'string' },
      ktaNumber: { field: 'ktaNumber', type: 'string' },
      employmentStatus: { field: 'employmentStatus', type: 'string' },
      joinDate: { field: 'joinDate', type: 'date' },
      status: { field: 'status', type: 'enum' },
      allowMobileAttendance: { field: 'allowMobileAttendance', type: 'boolean' },
      allowWebAccess: { field: 'allowWebAppAccess', type: 'boolean' },
    }

    // Process each field
    for (const [formKey, config] of Object.entries(fieldMap)) {
      const value = formData[formKey]
      
      // Skip empty/null values
      if (value === undefined || value === null || value === '') {
        continue
      }

      const { field, type } = config as any

  if (type === 'date') {
      updateData[field] = parseEmployeeDate(value, field)
      } else if (type === 'enum') {
        // Convert status to uppercase enum value
        const statusValue = value.toUpperCase()
        if (['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(statusValue)) {
          updateData[field] = statusValue
        }
      } else if (type === 'boolean') {
        updateData[field] = Boolean(value)
      } else if (type === 'string' && typeof value === 'string') {
        // Only add non-empty strings
        updateData[field] = value.trim()
      }
    }

    // 3. Handle location/siteId and auto-update companyId
    if (formData.location && formData.location !== '') {
      updateData.siteId = formData.location
      
      // Auto-populate companyId from site when location changes
      const site = await prisma.site.findUnique({
        where: { id: formData.location },
        select: { companyId: true }
      })
      if (site?.companyId) {
        updateData.companyId = site.companyId
      }
    }

    console.log('[v0] Prepared updateData:', updateData)

    // 4. Execute update
    const result = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true }
    })

    console.log('[v0] Update successful')

    // 5. Refresh
    revalidatePath('/dashboard/employees')
    return { success: true }
    
  } catch (error: any) {
    console.error('[v0] Update employee failed:', error)
    return { success: false, error: friendlyEmployeeError(error) }
  }
}

// ==========================================
// 2. ACTION BUAT CREATE EMPLOYEE BARU
// ==========================================
export async function createEmployeeAction(formData: any) {
  let authUserId = null; // Buat nyimpen ID kalau butuh di-rollback

  try {
    if (!formData.name?.trim()) throw new Error('INVALID_EMPLOYEE_FIELD:Full Name')
    if (!formData.employeeCode?.trim()) throw new Error('INVALID_EMPLOYEE_FIELD:Employee Code')
    if (!formData.siteId) throw new Error('INVALID_EMPLOYEE_FIELD:Location')

    const selectedSite = await prisma.site.findUnique({
      where: { id: formData.siteId },
      select: { id: true, companyId: true },
    })
    if (!selectedSite) throw new Error('INVALID_SITE:Location')
    if (!selectedSite.companyId) throw new Error('INVALID_SITE_COMPANY:Location')
    formData.companyId = selectedSite.companyId

    // 1. Sulap NIP/Employee Code jadi Email buat Supabase & Prisma
    // Asumsi di frontend lu ngirimnya pake properti `employeeCode`
    const hrisEmail = `${formData.employeeCode}@hris.com`.toLowerCase()

    // 2. Bikin Akun Login di Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: hrisEmail,
      password: formData.password,
      email_confirm: true,
      user_metadata: { name: formData.name }
    })

    if (authError) throw new Error("Gagal bikin kunci akses (Auth): " + authError.message)
    authUserId = authData.user.id; // Simpen ID-nya

    // 3. Masukin Data ke Prisma
    await prisma.user.create({
      data: {
        id: authUserId, // Jembatan dari Supabase Auth
        employeeCode: formData.employeeCode,
        name: formData.name,
        email: hrisEmail, 
        personalEmail: formData.personalEmail,
        department: formData.department,
        position: formData.position,
        role: formData.systemRole, // Pastikan dari frontend ngirim string yang match sama Enum lu
        
        // Relasi ke lokasi (site)
        // Note: Pastikan di dialog frontend, value dari dropdown location itu ngirim 'siteId'
        site: {
          connect: { id: formData.siteId }
        },

        // Konversi string tanggal dari form jadi object Date buat Prisma
        joinDate: parseEmployeeDate(formData.joinDate, 'Join Date'),
        birthDate: parseEmployeeDate(formData.dob, 'Birth Date'),
        ktaExpiry: parseEmployeeDate(formData.ktaExpiry, 'KTA Expiry'),

        // Data teks & angka biasa
        phoneNumber: formData.phoneNumber,
        ktpNumber: formData.ktpNumber,
        address: formData.address,
        birthCity: formData.cob,
        gender: formData.gender,
        bpjsNumber: formData.bpjsNumber,
        employmentStatus: formData.employmentStatus,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        bloodType: formData.bloodType,
        npwpNumber: formData.npwpNumber,
        ktaNumber: formData.ktaNumber,

        // Array
        certifications: formData.certifications || [],

        // Boolean
        allowMobileAttendance: formData.mobileAccess || false,
        allowWebAppAccess: formData.webAppAccess || false,
      }
    })

    // 4. Update companyId from site using Prisma (bypass RLS)
    if (formData.siteId && formData.companyId) {
      await prisma.user.update({
        where: { id: authUserId },
        data: { companyId: formData.companyId }
      }).catch(err => console.error("Warning: Could not set companyId:", err))
    }

    // 5. Refresh tabel
    revalidatePath('/dashboard/employees')
    return { success: true }

  } catch (error: any) {
    console.error("Error saat create employee:", error)
    
    // SAFETY NET TAMBAHAN: 
    // Kalau Prisma gagal nyimpen (misal KTP udah kepake), kita hapus juga akun Auth 
    // yang sempet kebuat di langkah 2 biar database lu ga ada akun zombie.
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
        .catch(err => console.error("Gagal rollback akun auth:", err))
    }

    return { success: false, error: friendlyEmployeeError(error) }
  }
}
