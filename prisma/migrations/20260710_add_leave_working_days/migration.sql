-- AlterTable
ALTER TABLE "leaves" ADD COLUMN "workingDaysCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dayBreakdown" TEXT;
