import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function hasAllModels(client: PrismaClient): boolean {
  return Object.values(Prisma.ModelName).every((modelName) => {
    const delegateName = modelName.charAt(0).toLowerCase() + modelName.slice(1)
    return delegateName in client
  })
}

const existingClient = globalForPrisma.prisma
const freshClient = existingClient && hasAllModels(existingClient) ? existingClient : undefined

if (existingClient && !freshClient) {
  void existingClient.$disconnect().catch(() => {})
}

export const prisma = freshClient ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
