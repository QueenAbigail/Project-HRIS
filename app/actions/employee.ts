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
    // 1. Kalau lu ngisi password baru di form, update ke Supabase Auth
    if (formData.password && formData.password.trim() !== '') {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: formData.password }
      )
      if (authError) throw new Error("Gagal update password: " + authError.message)
    }

    // 2. Filter & transform data sesuai Prisma User schema
    // Remove fields that don't exist in schema & prepare data untuk update
    const {
      password,
      location, // This is siteId from form
      locationCode,
      emergencyContact, // Not in schema
      bankAccount, // Not in schema
      taxId, // Not in schema
      ...validData
    } = formData

    // 3. Transform birthDate dari string "YYYY-MM-DD" ke ISO DateTime
    const updateData: any = {}
    
    // Hanya include fields yang ada di User schema
    const allowedFields = [
      'name', 'email', 'personalEmail', 'initials', 'department', 'position', 
      'status', 'joinDate', 'phoneNumber', 'ktpNumber', 'address', 'birthCity', 
      'birthDate', 'bpjsNumber', 'gender', 'maritalStatus', 'religion', 'bloodType',
      'npwpNumber', 'role'
    ]

    for (const key of allowedFields) {
      if (key in validData) {
        // Jika field adalah date, convert ke ISO DateTime format
        if (key === 'birthDate' && validData[key]) {
          // Convert "YYYY-MM-DD" to ISO DateTime (add time component)
          updateData[key] = new Date(validData[key] + 'T00:00:00Z')
        } else if (key === 'joinDate' && validData[key]) {
          updateData[key] = new Date(validData[key] + 'T00:00:00Z')
        } else if (validData[key] !== undefined && validData[key] !== null && validData[key] !== '') {
          updateData[key] = validData[key]
        }
      }
    }

    // 4. Update profil ke Prisma
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        // Handle site/location update
        ...(location && { siteId: location }),
      }
    })

    // 5. Refresh tabel
    revalidatePath('/dashboard/employees')
    return { success: true }
    
  } catch (error: any) {
    console.error("Error update:", error)
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
