import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Parse Excel file using XLSX
    const buffer = await file.arrayBuffer()
    const { read, utils } = await import('xlsx')
    const workbook = read(buffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = utils.sheet_to_json(worksheet)

    console.log('[v0] Parsed Excel data:', data.length, 'rows')

    // Import employees
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; name: string; error: string }>
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNum = i + 2 // +2 because row 1 is header, array is 0-indexed

      try {
        // Validate required fields
        if (!row['Full Name'] || !row['Email'] || !row['Employee Code (NIP)']) {
          results.failed++
          results.errors.push({
            row: rowNum,
            name: row['Full Name'] || 'Unknown',
            error: 'Missing required fields: Full Name, Email, or Employee Code'
          })
          continue
        }

        // Find the site
        const site = await prisma.site.findFirst({
          where: {
            OR: [
              { name: row['Location'] },
              { code: row['Location'] }
            ]
          },
          select: { id: true, companyId: true }
        })

        if (!site) {
          results.failed++
          results.errors.push({
            row: rowNum,
            name: row['Full Name'],
            error: `Location not found: ${row['Location']}`
          })
          continue
        }

        // Create auth user
        const hrisEmail = `${row['Employee Code (NIP)']}@hris.com`.toLowerCase()
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: hrisEmail,
          password: 'DefaultPass123!',
          email_confirm: true,
          user_metadata: { name: row['Full Name'] }
        })

        if (authError) throw new Error(`Auth error: ${authError.message}`)

        // Parse role and status
        const roleMap: Record<string, any> = {
          'STAFF': 'STAFF',
          'MANAGER': 'MANAGER',
          'SITE_ADMIN': 'SITE_ADMIN',
          'HR_ADMIN': 'HR_ADMIN',
          'SUPER_ADMIN': 'SUPER_ADMIN'
        }
        const role = roleMap[row['Role (STAFF/MANAGER/SITE_ADMIN/HR_ADMIN)']?.toUpperCase()] || 'STAFF'
        
        const statusMap: Record<string, any> = {
          'ACTIVE': 'ACTIVE',
          'INACTIVE': 'INACTIVE',
          'SUSPENDED': 'SUSPENDED'
        }
        const status = statusMap[row['Status (ACTIVE/INACTIVE/SUSPENDED)']?.toUpperCase()] || 'ACTIVE'

        // Parse certifications (comma-separated)
        const certs = row['Certifications (comma-separated)']
          ? row['Certifications (comma-separated)'].split(',').map((c: string) => c.trim())
          : []

        // Find supervisor if provided
        let supervisorId: string | null = null
        if (row['Supervisor Employee Code']) {
          const supervisor = await prisma.user.findFirst({
            where: { employeeCode: row['Supervisor Employee Code'] },
            select: { id: true }
          })
          supervisorId = supervisor?.id || null
        }

        // Create user in database with all fields
        await prisma.user.create({
          data: {
            id: authData.user.id,
            employeeCode: row['Employee Code (NIP)'],
            name: row['Full Name'],
            email: hrisEmail,
            personalEmail: row['Personal Email'] || row['Email'],
            initials: row['Full Name']?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 3),
            department: row['Department'] || 'Unassigned',
            position: row['Position'] || 'Unassigned',
            siteId: site.id,
            companyId: site.companyId,
            supervisorId: supervisorId,
            joinDate: row['Join Date'] ? new Date(row['Join Date']) : new Date(),
            phoneNumber: row['Phone Number'],
            ktpNumber: row['KTP Number'],
            address: row['Address'],
            birthCity: row['Birth City'],
            birthDate: row['Birth Date'] ? new Date(row['Birth Date']) : null,
            bpjsNumber: row['BPJS Number'],
            gender: row['Gender'],
            religion: row['Religion'],
            maritalStatus: row['Marital Status'],
            employmentStatus: row['Employment Status'],
            bloodType: row['Blood Type'],
            npwpNumber: row['NPWP Number'],
            ktaNumber: row['KTA Number'],
            certifications: certs,
            ktaExpiry: row['KTA Expiry'] ? new Date(row['KTA Expiry']) : null,
            role: role,
            status: status,
            bankName: row['Bank Name'],
            accountHolder: row['Account Holder'],
            accountNumber: row['Account Number'],
            allowMobileAttendance: false,
            allowWebAppAccess: false
          }
        })

        results.success++
      } catch (error) {
        results.failed++
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push({
          row: rowNum,
          name: row['Full Name'] || 'Unknown',
          error: errorMsg
        })
        console.error(`[v0] Failed to import row ${rowNum}:`, errorMsg)
      }
    }

    return NextResponse.json({
      success: results.success,
      failed: results.failed,
      total: data.length,
      errors: results.errors
    })
  } catch (error) {
    console.error('[v0] Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}
