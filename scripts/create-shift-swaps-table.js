const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Execute each SQL command separately
    console.log('Creating shift_swaps table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS shift_swaps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "employeeFromId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "employeeToId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          "swapDate" DATE NOT NULL,
          "siteId" TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'Pending',
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating unique index...');
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "shift_swaps_employeeFromId_employeeToId_swapDate_key" 
       ON shift_swaps("employeeFromId", "employeeToId", "swapDate")`
    );

    console.log('Creating indexes...');
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "shift_swaps_employeeFromId_idx" ON shift_swaps("employeeFromId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "shift_swaps_employeeToId_idx" ON shift_swaps("employeeToId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "shift_swaps_status_idx" ON shift_swaps(status)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "shift_swaps_swapDate_idx" ON shift_swaps("swapDate")`);

    console.log('✅ shift_swaps table created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
