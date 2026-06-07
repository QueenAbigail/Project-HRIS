import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

try {
  if (!globalForPrisma.prisma) {
    prismaInstance = new PrismaClient();
  } else {
    prismaInstance = globalForPrisma.prisma;
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  console.warn('[v0] Failed to initialize Prisma client:', error instanceof Error ? error.message : String(error));
  // Prisma client will be undefined if DATABASE_URL is not set
}

export const prisma = prismaInstance as PrismaClient | undefined;
