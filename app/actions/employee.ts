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

    // 2. Buang password dari data biar Prisma nggak error (karena di tabel Prisma ga ada password)
    const { password, location, locationCode, ...prismaData } = formData

    // 3. Update profil sisanya ke Prisma
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...prismaData,
        // Ini buat update relasi lokasi kalau lu ganti assignment-nya
        // location adalah siteId dari form, locationCode adalah site code
        site: location ? { connect: { id: location } } : undefined,
      }
    })

    // Biar tabel otomatis refresh nampilin data baru
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
