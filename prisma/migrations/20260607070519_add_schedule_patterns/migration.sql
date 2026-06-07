-- CreateEnum
CREATE TYPE "PatternType" AS ENUM ('FIXED', 'ROTATING', 'MODULO');

-- CreateEnum
CREATE TYPE "ShiftTypePattern" AS ENUM ('MORNING', 'NIGHT', 'OFF');

-- Add schedulePatterns relation to shifts table if not exists
-- AlterTable
ALTER TABLE "shifts" ADD COLUMN "schedulePatterns" TEXT;

-- CreateTable
CREATE TABLE "schedule_patterns" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "type" "PatternType" NOT NULL,
    "workingDays" jsonb,
    "shiftId" text,
    "rotatingPattern" jsonb,
    "moduloPattern" jsonb,
    "isActive" boolean NOT NULL DEFAULT true,
    "assignedEmployees" integer NOT NULL DEFAULT 0,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,

    CONSTRAINT "schedule_patterns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedule_patterns" ADD CONSTRAINT "schedule_patterns_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
