-- CreateTable bko_assignments
CREATE TABLE "bko_assignments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "leaveId" UUID NOT NULL,
  "substituteId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Aktif',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "bko_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bko_assignments_leaveId_idx" ON "bko_assignments"("leaveId");

-- CreateIndex
CREATE INDEX "bko_assignments_substituteId_idx" ON "bko_assignments"("substituteId");

-- CreateIndex
CREATE INDEX "bko_assignments_status_idx" ON "bko_assignments"("status");

-- AddForeignKey
ALTER TABLE "bko_assignments" ADD CONSTRAINT "bko_assignments_leaveId_fkey" FOREIGN KEY ("leaveId") REFERENCES "leaves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bko_assignments" ADD CONSTRAINT "bko_assignments_substituteId_fkey" FOREIGN KEY ("substituteId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
