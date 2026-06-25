-- Add companyId column to users table
ALTER TABLE "users" ADD COLUMN "companyId" TEXT;

-- Add foreign key constraint to companies table
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for companyId
CREATE INDEX "users_companyId_idx" ON "users"("companyId");
