-- Create enum for recurring earning calculation methods
DO $$ BEGIN
    CREATE TYPE "EarningCalculationType" AS ENUM ('fixed_monthly', 'per_attendance_day', 'per_shift');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payroll_earnings table for client-specific recurring earning rules
CREATE TABLE IF NOT EXISTS "payroll_earnings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "siteId" TEXT,
    "positionId" TEXT,
    "name" TEXT NOT NULL,
    "calculationType" "EarningCalculationType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_earnings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "payroll_earnings_companyId_idx" ON "payroll_earnings"("companyId");
CREATE INDEX IF NOT EXISTS "payroll_earnings_siteId_idx" ON "payroll_earnings"("siteId");
CREATE INDEX IF NOT EXISTS "payroll_earnings_positionId_idx" ON "payroll_earnings"("positionId");
CREATE INDEX IF NOT EXISTS "payroll_earnings_status_idx" ON "payroll_earnings"("status");
CREATE INDEX IF NOT EXISTS "payroll_earnings_effectiveFrom_idx" ON "payroll_earnings"("effectiveFrom");

DO $$ BEGIN
    ALTER TABLE "payroll_earnings" ADD CONSTRAINT "payroll_earnings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payroll_earnings" ADD CONSTRAINT "payroll_earnings_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "payroll_earnings" ADD CONSTRAINT "payroll_earnings_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "master_data"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
