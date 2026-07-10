-- CreateTable ShiftSwap
CREATE TABLE "shift_swaps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeFromId" TEXT NOT NULL,
    "employeeToId" TEXT NOT NULL,
    "swapDate" DATE NOT NULL,
    "siteId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_swaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shift_swaps_employeeFromId_employeeToId_swapDate_key" ON "shift_swaps"("employeeFromId", "employeeToId", "swapDate");

-- CreateIndex
CREATE INDEX "shift_swaps_employeeFromId_idx" ON "shift_swaps"("employeeFromId");

-- CreateIndex
CREATE INDEX "shift_swaps_employeeToId_idx" ON "shift_swaps"("employeeToId");

-- CreateIndex
CREATE INDEX "shift_swaps_status_idx" ON "shift_swaps"("status");

-- CreateIndex
CREATE INDEX "shift_swaps_swapDate_idx" ON "shift_swaps"("swapDate");

-- AddForeignKey
ALTER TABLE "shift_swaps" ADD CONSTRAINT "shift_swaps_employeeFromId_fkey" FOREIGN KEY ("employeeFromId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swaps" ADD CONSTRAINT "shift_swaps_employeeToId_fkey" FOREIGN KEY ("employeeToId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swaps" ADD CONSTRAINT "shift_swaps_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
