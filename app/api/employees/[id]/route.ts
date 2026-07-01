import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Delete from Supabase Auth
    const supabaseAdminClient = require('@supabase/supabase-js').createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error: authError } = await supabaseAdminClient.auth.admin.deleteUser(id)
    
    if (authError) {
      console.error('[v0] Auth delete error:', authError)
      // Continue with database deletion even if auth deletion fails
    }

    // Delete from database
    await prisma.user.delete({
      where: { id }
    })

    console.log('[v0] Employee deleted successfully:', id)
    
    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    })
  } catch (error) {
    console.error('[v0] Delete employee error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete employee',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
