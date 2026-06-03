'use server'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Senjata rahasia lu: Kunci Master Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    }

    // Process each field
    for (const [formKey, config] of Object.entries(fieldMap)) {
      const value = formData[formKey]
      
      // Skip empty/null values
      if (value === undefined || value === null || value === '') {
        continue
      }

      const { field, type } = config as any

      if (type === 'date' && typeof value === 'string') {
        // Convert date string to DateTime
        updateData[field] = new Date(value + 'T00:00:00Z')
      } else if (type === 'enum') {
        // Convert status to uppercase enum value
        const statusValue = value.toUpperCase()
        if (['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(statusValue)) {
          updateData[field] = statusValue
        }
      } else if (type === 'string' && typeof value === 'string') {
        // Only add non-empty strings
        updateData[field] = value.trim()
      }
    }

    // 3. Handle location/siteId
    if (formData.location && formData.location !== '') {
      updateData.siteId = formData.location
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
    console.error('[v0] Update error:', error.message)
    return { success: false, error: error.message }
  }
}

// ==========================================
// 2. ACTION BUAT CREATE EMPLOYEE BARU
// ==========================================
export async function createEmployeeAction(formData: any) {
  let authUserId = null; // Buat nyimpen ID kalau butuh di-rollback

  try {
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
        role: formData.systemRole, // Pastikan dari frontend ngirim string yang match sama Enum lu
        
        // Relasi ke lokasi (site)
        // Note: Pastikan di dialog frontend, value dari dropdown location itu ngirim 'siteId'
        site: {
          connect: { id: formData.siteId }
        },

        // Konversi string tanggal dari form jadi object Date buat Prisma
        joinDate: formData.joinDate ? new Date(formData.joinDate) : null,
        birthDate: formData.dob ? new Date(formData.dob) : null,
        ktaExpiry: formData.ktaExpiry ? new Date(formData.ktaExpiry) : null,

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

    // 4. Refresh tabel
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

    return { success: false, error: error.message }
  }
}
