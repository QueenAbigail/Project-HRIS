import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import type { Prisma, User } from '@prisma/client'

const WEBSITE_ROLES = new Set(['SUPER_ADMIN', 'HR_ADMIN', 'SITE_ADMIN', 'MANAGER', 'CLIENT'])

export async function getLeaveReadAuthorization(): Promise<
  | { user: User; where: Prisma.LeaveWhereInput }
  | { user: null; error: 'UNAUTHORIZED' | 'FORBIDDEN' }
> {
  const user = await getCurrentUser()

  if (!user) return { user: null, error: 'UNAUTHORIZED' }
  if (!WEBSITE_ROLES.has(user.role)) return { user: null, error: 'FORBIDDEN' }

  return {
    user,
    where: user.role === 'CLIENT'
      ? { user: { companyId: user.companyId ?? '__no_company__' } }
      : {},
  }
}

export function leaveAuthorizationResponse(error: 'UNAUTHORIZED' | 'FORBIDDEN') {
  return Response.json(
    { error: error === 'UNAUTHORIZED' ? 'Unauthorized' : 'Forbidden' },
    { status: error === 'UNAUTHORIZED' ? 401 : 403 },
  )
}

export function canManageLeaves(role: string) {
  return role === 'SUPER_ADMIN' || role === 'HR_ADMIN'
}

export { prisma }
