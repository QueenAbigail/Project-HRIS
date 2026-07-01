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
    
    // Read all data as array of arrays to parse manually
    const aoa = utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    if (aoa.length < 2) {
      return NextResponse.json(
        { error: 'Excel file must have headers and at least one data row', success: 0, failed: 0, errors: [] },
        { status: 400 }
      )
    }
    
    // First row is headers - normalize them (remove asterisks, trim whitespace, remove parentheses content)
    const headers = (aoa[0] as string[]).map((h: any) => {
      return h?.toString()
        .trim()
        .replace(/\*$/, '') // Remove trailing asterisk
        .replace(/^\*/, '') // Remove leading asterisk
        .replace(/\s*\([^)]*\)/g, '') // Remove content in parentheses like "(Site)", "(NIP)"
        .trim() || ''
    })
    console.log('[v0] Excel headers:', headers)
    
    // Map headers to column indices
    const headerMap: Record<string, number> = {}
    headers.forEach((header, idx) => {
      headerMap[header] = idx
    })
    
    // Parse data rows (skip header row)
    const normalizedData = aoa.slice(1).map((row: any, rowIdx: number) => {
      const normalized: any = {}
      headers.forEach((header, idx) => {
        // Get value, handling both array and object formats
        const value = Array.isArray(row) ? row[idx] : row[header]
        normalized[header] = value?.toString().trim() || ''
      })
      return normalized
    }).filter((row: any) => Object.values(row).some((v: any) => v)) // Filter empty rows

    console.log('[v0] Parsed Excel data:', normalizedData.length, 'rows')
    if (normalizedData.length > 0) {
      console.log('[v0] First row keys:', Object.keys(normalizedData[0]))
      console.log('[v0] First row data:', normalizedData[0])
    }

    // Import employees
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; name: string; error: string }>
    }

    for (let i = 0; i < normalizedData.length; i++) {
      const row = normalizedData[i] as any
      const rowNum = i + 2 // +2 because row 1 is header, array is 0-indexed

      try {
        // Validate required fields (use normalized header names)
        const fullName = row['Full Name']
        const employeeCode = row['Employee Code']
        
        if (!fullName || !employeeCode) {
          results.failed++
          results.errors.push({
            row: rowNum,
            name: fullName || 'Unknown',
            error: `Missing required fields: Full Name or Employee Code. Got: ${JSON.stringify({fullName, employeeCode})}`
          })
          continue
        }

        // Find the site (use normalized Location header)
        const locationName = row['Location']
        const site = await prisma.site.findFirst({
          where: {
            OR: [
              { name: locationName },
              { code: locationName }
            ]
          },
          select: { id: true, companyId: true }
        })

        if (!site) {
          results.failed++
          results.errors.push({
            row: rowNum,
            name: fullName,
            error: `Location not found: ${locationName}. Please check your Excel file.`
          })
          continue
        }

        // Check if user already exists with this employeeCode
        const existingUser = await prisma.user.findFirst({
          where: { employeeCode: employeeCode },
          select: { id: true }
        })

        // Create auth user with default password matching manual add (only if new user)
        const hrisEmail = `${employeeCode}@hris.com`.toLowerCase()
        let authData: any
        
        if (!existingUser) {
          // New user - create auth account
          const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: hrisEmail,
            password: 'promaxima',
            email_confirm: true,
            user_metadata: { name: row['Full Name'] }
          })
          
          if (authError) throw new Error(`Auth error: ${authError.message}`)
          authData = data
        } else {
          // Existing user - use their ID
          authData = { user: { id: existingUser.id } }
        }

        // Parse role and status (use normalized headers)
        const roleMap: Record<string, any> = {
          'STAFF': 'STAFF',
          'MANAGER': 'MANAGER',
          'SITE_ADMIN': 'SITE_ADMIN',
          'HR_ADMIN': 'HR_ADMIN',
          'SUPER_ADMIN': 'SUPER_ADMIN'
        }
        const role = roleMap[row['Role']?.toUpperCase()] || 'STAFF'
        
        const statusMap: Record<string, any> = {
          'ACTIVE': 'ACTIVE',
          'INACTIVE': 'INACTIVE',
          'SUSPENDED': 'SUSPENDED'
        }
        const status = statusMap[row['Status']?.toUpperCase()] || 'ACTIVE'

        // Helper to convert "-" or empty to NULL
        const toNullIfEmpty = (val: any) => {
          if (!val || val === '-' || val.trim() === '-') return null
          return val || null
        }

        // Parse certifications (comma-separated)
        const certsStr = row['Certifications']
        const certs = certsStr && certsStr !== '-' 
          ? certsStr.split(',').map((c: string) => c.trim())
          : []

        // Find supervisor if provided
        let supervisorId: string | null = null
        if (row['Supervisor'] && row['Supervisor'] !== '-') {
          const supervisor = await prisma.user.findFirst({
            where: { employeeCode: row['Supervisor'] },
            select: { id: true }
          })
          supervisorId = supervisor?.id || null
        }

        // Prepare user data with NULL handling
        const userData = {
          id: authData.user.id,
          employeeCode: employeeCode,
          name: fullName,
          email: hrisEmail,
          personalEmail: toNullIfEmpty(row['Personal Email']),
          initials: fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 3),
          department: row['Department'] || 'Unassigned',
          position: row['Position'] || 'Unassigned',
          siteId: site.id,
          companyId: site.companyId,
          supervisorId: supervisorId,
          joinDate: row['Join Date'] ? new Date(row['Join Date']) : new Date(),
          phoneNumber: toNullIfEmpty(row['Phone Number']),
          ktpNumber: toNullIfEmpty(row['KTP Number']),
          address: toNullIfEmpty(row['Address']),
          birthCity: toNullIfEmpty(row['Birth City']),
          birthDate: row['Birth Date'] ? new Date(row['Birth Date']) : null,
          bpjsNumber: toNullIfEmpty(row['BPJS Number']),
          gender: toNullIfEmpty(row['Gender']),
          religion: toNullIfEmpty(row['Religion']),
          maritalStatus: toNullIfEmpty(row['Marital Status']),
          employmentStatus: toNullIfEmpty(row['Employment Status']),
          bloodType: toNullIfEmpty(row['Blood Type']),
          npwpNumber: toNullIfEmpty(row['NPWP Number']),
          ktaNumber: toNullIfEmpty(row['KTA Number']),
          certifications: certs,
          ktaExpiry: row['KTA Expiry'] ? new Date(row['KTA Expiry']) : null,
          role: role,
          status: status,
          bankName: toNullIfEmpty(row['Bank Name']),
          accountHolder: toNullIfEmpty(row['Account Holder']),
          accountNumber: toNullIfEmpty(row['Account Number']),
          allowMobileAttendance: false,
          allowWebAppAccess: false
        }

        // Create or update user
        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: userData
          })
        } else {
          // Create new user
          await prisma.user.create({
            data: userData
          })
        }

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
      total: normalizedData.length,
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
