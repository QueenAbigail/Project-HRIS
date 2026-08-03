import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { createAdminClient } from '@/lib/auth'

let supabase: any = null

async function getSupabaseClient() {
  if (!supabase) {
    supabase = await createAdminClient()
  }
  return supabase
}

// GET /api/broadcast/announcements/[id] - Get single announcement with analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: params.id },
      include: {
        readStatuses: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        createdByUser: {
          select: { name: true, email: true },
        },
      },
    })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    const totalRecipients = announcement.readStatuses.length
    const readCount = announcement.readStatuses.filter((rs) => rs.readAt).length
    const unreadCount = totalRecipients - readCount

    const readByUsers = announcement.readStatuses
      .filter((rs) => rs.readAt)
      .map((rs) => ({
        id: rs.user.id,
        name: rs.user.name || rs.user.email,
        readAt: rs.readAt,
      }))

    const unreadUsers = announcement.readStatuses
      .filter((rs) => !rs.readAt)
      .map((rs) => ({
        id: rs.user.id,
        name: rs.user.name || rs.user.email,
      }))

    return NextResponse.json({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      recipientType: announcement.recipientType,
      priority: announcement.priority,
      attachmentUrl: announcement.attachmentUrl,
      isActive: announcement.isActive,
      expiresAt: announcement.expiresAt,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      createdBy: announcement.createdByUser.name || announcement.createdByUser.email,
      analytics: {
        totalRecipients,
        readCount,
        unreadCount,
        readPercentage: totalRecipients > 0 ? (readCount / totalRecipients * 100).toFixed(1) : 0,
        readByUsers,
        unreadUsers,
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching announcement:', error)
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 })
  }
}

// PUT /api/broadcast/announcements/[id] - Update announcement
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, body: content, priority } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if announcement exists and user has permission to edit
    const existing = await prisma.announcement.findUnique({
      where: { id: params.id },
      select: { createdBy: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    if (existing.createdBy !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        title,
        body: content,
        priority: priority || 'MEDIUM',
      },
    })

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      body: updated.body,
      updatedAt: updated.updatedAt,
    })
  } catch (error) {
    console.error('[v0] Error updating announcement:', error)
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
  }
}

// DELETE /api/broadcast/announcements/[id] - Delete announcement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if announcement exists and user has permission to delete
    const announcement = await prisma.announcement.findUnique({
      where: { id: params.id },
      select: { createdBy: true, attachmentUrl: true },
    })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    if (announcement.createdBy !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete attachment from Supabase if exists
    if (announcement.attachmentUrl) {
      try {
        const sb = await getSupabaseClient()
        const url = new URL(announcement.attachmentUrl)
        const fileName = url.pathname.split('/').pop()
        if (fileName) {
          await sb.storage.from('announcement').remove([fileName])
        }
      } catch (err) {
        console.error('[v0] Error deleting attachment:', err)
        // Continue with deletion even if attachment deletion fails
      }
    }

    // Delete announcement (cascade deletes read statuses)
    await prisma.announcement.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting announcement:', error)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
