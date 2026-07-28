import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env files
function loadEnv() {
  const envFiles = [
    path.join(process.cwd(), '/.env.local'),
    path.join(process.cwd(), '/.env'),
    '/vercel/share/.env.project',
  ]

  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      content.split('\n').forEach((line) => {
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=')
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
          if (key && !process.env[key.trim()]) {
            process.env[key.trim()] = value
          }
        }
      })
    }
  }
}

loadEnv()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')

  try {
    // Initialize Supabase Admin client for auth operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(`Missing environment variables:
- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}
- SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✓' : '✗'}`)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const adminEmail = 'admin@hris.com'
    const adminPassword = 'mamank21'
    const adminName = 'Administrator'

    console.log(`📝 Creating admin user with email: ${adminEmail}`)

    // 1. Create user in Supabase Auth or get existing
    let userId: string

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: adminName,
      },
    })

    if (authError && authError.message.includes('already been registered')) {
      // User already exists, get by email
      console.log('ℹ️  Admin user already exists, using existing account')
      try {
        const { data: userList, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) {
          console.warn(`⚠️  Could not list users: ${listError.message}. Proceeding with generic ID.`)
          // Generate a placeholder ID - the user might still exist in the database
          userId = 'existing-admin-user'
        } else {
          const existingAdminUser = userList?.users?.find((u: any) => u.email === adminEmail)
          if (existingAdminUser) {
            userId = existingAdminUser.id
          } else {
            console.warn(`⚠️  Could not find admin user in list, proceeding with generic ID`)
            userId = 'existing-admin-user'
          }
        }
      } catch (err: any) {
        console.warn(`⚠️  Error listing users: ${err.message}. Proceeding with generic ID.`)
        userId = 'existing-admin-user'
      }
    } else if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    } else {
      userId = authUser?.user?.id || ''
    }

    if (!userId) {
      throw new Error('Failed to get user ID from Supabase Auth')
    }

    console.log(`✅ Auth user ready with ID: ${userId}`)

    // 2. Get or create a default site for the admin user
    let site = await prisma.site.findFirst({
      where: { code: 'ADMIN_SITE' },
    })

    if (!site) {
      site = await prisma.site.create({
        data: {
          name: 'Admin Site',
          code: 'ADMIN_SITE',
          totalStaff: 1,
        },
      })
      console.log(`✅ Created default site: ${site.name}`)
    }

    // 3. Create corresponding User record in database
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
      create: {
        id: userId,
        name: adminName,
        email: adminEmail,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        siteId: site.id,
        employeeCode: 'ADMIN',
        allowMobileAttendance: true,
        allowWebAppAccess: true,
      },
    })

    console.log(`✅ Database user created: ${dbUser.email} with role: ${dbUser.role}`)

    // 4. Create default shifts
    const shiftsData = [
      { id: 'morning', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', gracePeriodMinutes: 10 },
      { id: 'day', name: 'Day Shift', startTime: '08:00', endTime: '16:00', gracePeriodMinutes: 10 },
      { id: 'evening', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', gracePeriodMinutes: 10 },
      { id: 'night', name: 'Night Shift', startTime: '22:00', endTime: '06:00', gracePeriodMinutes: 10 },
    ]

    for (const shiftData of shiftsData) {
      await prisma.shift.upsert({
        where: { id: shiftData.id },
        update: {},
        create: shiftData,
      })
    }
    console.log(`✅ Created/verified ${shiftsData.length} default shifts`)

    console.log(`
🎉 Seed completed successfully!

Admin Account Details:
- Email: ${adminEmail}
- Password: ${adminPassword}
- Role: SUPER_ADMIN
- Status: ACTIVE

You can now log in with these credentials!
    `)
  } catch (error) {
    console.error('❌ Seed failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
