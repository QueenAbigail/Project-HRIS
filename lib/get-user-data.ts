import { prisma } from './prisma'

export interface User {
  name: string | null
  email: string
  position: string | null
  role: string
  employeeCode?: string | null
  siteName?: string | null
  avatar?: string | null
}

export async function getUserData(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      name: true,
      position: true,
      role: true,
      email: true,
      employeeCode: true,
      avatar: true,
      site: {
        select: {
          name: true
        }
      }
    }
  })

  if (!user) return null

  return {
    name: user.name,
    email: user.email,
    position: user.position,
    role: user.role,
    employeeCode: user.employeeCode,
    avatar: user.avatar,
    siteName: user.site?.name
  }
}
