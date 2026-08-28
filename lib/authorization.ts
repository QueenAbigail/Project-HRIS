export const WEBSITE_ROLES = [
  'SUPER_ADMIN',
  'HR_ADMIN',
  'SITE_ADMIN',
  'MANAGER',
  'CLIENT',
] as const

export function canAccessWebsite(role?: string | null) {
  return Boolean(role && WEBSITE_ROLES.includes(role as (typeof WEBSITE_ROLES)[number]))
}

export function canManageLeave(role?: string | null) {
  return role === 'SUPER_ADMIN' || role === 'HR_ADMIN'
}
