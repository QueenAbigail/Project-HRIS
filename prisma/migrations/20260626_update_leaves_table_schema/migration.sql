-- Drop existing Leave table
DROP TABLE IF EXISTS "leaves" CASCADE;

-- Create new Leave table with updated schema
CREATE TABLE "leaves" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "leaveType" TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "reason" TEXT,
  "attachmentUrl" TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "leaves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "leaves_userId_idx" ON "leaves"("userId");
CREATE INDEX "leaves_status_idx" ON "leaves"("status");
