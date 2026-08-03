import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/broadcast/announcements - Fetch announcements with search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { body: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Fetch announcements with read status counts
    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        readStatuses: {
          select: { userId: true, readAt: true, dismissedAt: true },
        },
        createdByUser: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Format response with read counts
    const formattedAnnouncements = announcements.map((ann) => {
      const totalRecipients = ann.readStatuses.length
      const readCount = ann.readStatuses.filter((rs) => rs.readAt).length

      return {
        id: ann.id,
        title: ann.title,
        body: ann.body,
        recipientType: ann.recipientType,
        priority: ann.priority,
        recipientCount: totalRecipients,
        readCount,
        unreadCount: totalRecipients - readCount,
        attachmentUrl: ann.attachmentUrl,
        isActive: ann.isActive,
        expiresAt: ann.expiresAt,
        createdAt: ann.createdAt,
        updatedAt: ann.updatedAt,
        createdBy: ann.createdByUser.name || ann.createdByUser.email,
      }
    })

    const total = await prisma.announcement.count({ where })

    return NextResponse.json({
      data: formattedAnnouncements,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

// POST /api/broadcast/announcements - Create announcement + auto-create notifications
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const body = formData.get('body') as string
    const recipientType = formData.get('recipientType') as string
    const attachment = formData.get('attachment') as File | null
    const siteId = formData.get('siteId') as string | null
    const employeeIds = formData.get('employeeIds') as string | null

    // Validation
    if (!title || !body || !recipientType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let attachmentUrl: string | null = null

    // Upload PDF if provided
    if (attachment && attachment.size > 0) {
      const buffer = await attachment.arrayBuffer()
      const fileName = `${Date.now()}-${attachment.name}`
      const { data, error } = await supabase.storage
        .from('announcement')
        .upload(fileName, new Uint8Array(buffer), {
          contentType: 'application/pdf',
        })

      if (error) {
        console.error('[v0] PDF upload error:', error)
        return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 })
      }

      const { data: publicUrlData } = supabase.storage
        .from('announcement')
        .getPublicUrl(fileName)

      attachmentUrl = publicUrlData.publicUrl
    }

    // Determine target recipients
    let targetUserIds: string[] = []

    if (recipientType === 'ALL_EMPLOYEES') {
      // Get all employees
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      })
      targetUserIds = allUsers.map((u) => u.id)
    } else if (recipientType === 'SITE_WIDE' && siteId) {
      // Get all employees at selected site
      const siteUsers = await prisma.user.findMany({
        where: { siteId },
        select: { id: true },
      })
      targetUserIds = siteUsers.map((u) => u.id)
    } else if ((recipientType === 'PERSONAL' || recipientType === 'MULTI_SITE') && employeeIds) {
      // Get specific employees
      const ids = JSON.parse(employeeIds)
      targetUserIds = ids
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        recipientType: recipientType as any,
        priority: 'MEDIUM',
        attachmentUrl,
        createdBy: user.id,
      },
      include: {
        readStatuses: {
          select: { userId: true, readAt: true },
        },
      },
    })

    // Create announcement read status entries for all recipients
    await prisma.announcementReadStatus.createMany({
      data: targetUserIds.map((userId) => ({
        announcementId: announcement.id,
        userId,
      })),
      skipDuplicates: true,
    })

    // Create notification entries for push notifications
    // Get notification preferences (assuming default is immediate notification)
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map((userId) => ({
        userId,
        type: 'ANNOUNCEMENT',
        title: title,
        message: body.substring(0, 100),
        relatedId: announcement.id,
        relatedType: 'ANNOUNCEMENT',
        isRead: false,
      })),
      skipDuplicates: true,
    })

    console.log('[v0] Created announcement with', targetUserIds.length, 'recipients and', notifications.count, 'notifications')

    return NextResponse.json({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      recipientCount: targetUserIds.length,
      attachmentUrl: announcement.attachmentUrl,
      createdAt: announcement.createdAt,
    })
  } catch (error) {
    console.error('[v0] Error creating announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
